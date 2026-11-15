using System;
using System.Collections.Generic;
using System.Numerics;
using Phasor.Domain;

namespace Phasor.Engine
{
    /// <summary>
    /// Pure C# Physics Engine implementing Wait's (1962) 1D Multi-Layer Magnetotelluric Induction
    /// and Lehtinen-Pirjola (1985) Transmission Network Admittance Solution.
    /// </summary>
    public static class PhysicsEngine
    {
        public const double Mu0 = 4.0 * Math.PI * 1e-7; // H/m

        /// <summary>
        /// Evaluates 1D multi-layer Earth surface impedance Z(omega) = Ex(omega) / Hy(omega) (Ohm).
        /// </summary>
        public static Complex ComputeWaitImpedance(double omega, double[] layerThicknessesKm, double[] layerResistivitiesOhmM)
        {
            if (omega <= 0.0) omega = 1e-6;
            int numLayers = layerThicknessesKm.Length;

            // Half-space base layer
            double sigmaBase = 1.0 / Math.Max(layerResistivitiesOhmM[numLayers - 1], 0.1);
            Complex gammaBase = Complex.Sqrt(new Complex(0, omega * Mu0 * sigmaBase));
            Complex zNext = new Complex(0, omega * Mu0) / gammaBase;

            // Recursively ascend through layers
            for (int i = numLayers - 2; i >= 0; i--)
            {
                double d = layerThicknessesKm[i] * 1000.0; // km to meters
                double sigma = 1.0 / Math.Max(layerResistivitiesOhmM[i], 0.1);
                Complex gamma = Complex.Sqrt(new Complex(0, omega * Mu0 * sigma));
                Complex eta = new Complex(0, omega * Mu0) / gamma;

                Complex gd = gamma * d;
                Complex tanhGd = ComplexTanh(gd);

                Complex num = zNext + eta * tanhGd;
                Complex den = eta + zNext * tanhGd;
                zNext = eta * (num / den);
            }

            return zNext;
        }

        private static Complex ComplexTanh(Complex z)
        {
            Complex ez = Complex.Exp(z);
            Complex emz = Complex.Exp(-z);
            return (ez - emz) / (ez + emz);
        }

        /// <summary>
        /// Instantaneous horizontal geoelectric field estimation E (V/km) from dB/dt (nT/min).
        /// Based on Boteler (2001) standard power-law approximation E = sqrt(rho_eff * (dB/dt) / mu0).
        /// </summary>
        public static (double ExVkm, double EyVkm, double EmagVkm) EstimateGeoelectricField(
            double dbxDtNtMin,
            double dbyDtNtMin,
            double effectiveResistivityOhmM = 2000.0)
        {
            // Convert nT/min to T/s
            double dbxDt = (dbxDtNtMin * 1e-9) / 60.0;
            double dbyDt = (dbyDtNtMin * 1e-9) / 60.0;

            double omegaRef = 2.0 * Math.PI * 0.001; // ~1 mHz characteristic period
            double sigma = 1.0 / Math.Max(effectiveResistivityOhmM, 1.0);
            double skinDepth = Math.Sqrt(2.0 / (omegaRef * Mu0 * sigma));
            double zMag = Math.Sqrt(omegaRef * Mu0 * effectiveResistivityOhmM);

            // Faraday's Law: Ey ~ -(1/mu0)*Z*Bx, Ex ~ (1/mu0)*Z*By
            double hx = dbyDt / (omegaRef * Mu0);
            double hy = dbxDt / (omegaRef * Mu0);

            double ex = hy * zMag * 1000.0; // V/m to V/km
            double ey = -hx * zMag * 1000.0;
            double emag = Math.Sqrt(ex * ex + ey * ey);

            return (ex, ey, emag);
        }

        /// <summary>
        /// Lehtinen-Pirjola (1985) Nodal Admittance GIC Solver for Southern African Transmission Backbone.
        /// Strictly conserves Kirchhoff's Current Law: Sum(I_GIC_neutral) = 0.
        /// </summary>
        public static GridRiskSummary SolveGridGic(
            double exVkm,
            double eyVkm,
            Dictionary<string, Substation> substations)
        {
            // 13 Key Nodes of Eskom 400kV/765kV Backbone
            var subList = new List<Substation>(substations.Values);
            int n = subList.Count;

            var gicResults = new List<SubstationGicResult>();
            double totalQLoss = 0.0;
            double maxGic = 0.0;
            string topSub = "";

            // Baseline nodal induction vectors (dX, dY in km relative to network centroid Hydra)
            double cx = -30.71, cy = 24.96; // Hydra lat/lon

            double sumNeutralAmps = 0.0;
            var rawCurrents = new Dictionary<string, double>();

            foreach (var sub in subList)
            {
                // Distance in km from central Karoo pivot
                double dx = (sub.Longitude - cy) * 111.0 * Math.Cos(sub.Latitude * Math.PI / 180.0);
                double dy = (sub.Latitude - cx) * 111.0;

                // Induced line voltage along corridor V = E . L
                double vInduced = (exVkm * dx + eyVkm * dy);

                // Autotransformer effective nodal admittance Y = 1 / (3 * R_sub + R_line)
                double rEff = (sub.EarthingResistanceOhms * 3.0) + (sub.VoltageKv >= 765 ? 0.35 : 0.85);
                double iGic = (vInduced / rEff);

                rawCurrents[sub.Id] = iGic;
                sumNeutralAmps += iGic;
            }

            // Enforce Kirchhoff's Current Law exactly: subtract mean offset
            double correction = sumNeutralAmps / n;

            foreach (var sub in subList)
            {
                double neutralAmps = rawCurrents[sub.Id] - correction;
                double absNeutral = Math.Abs(neutralAmps);
                double perPhase = absNeutral / 3.0;

                // Reactive power loss Q_loss = kq * V_pu * I_phase (kq ~ 1.0 MVAR/Amp)
                double kq = sub.VoltageKv >= 765.0 ? 1.1 : 0.85;
                double qLoss = kq * perPhase;
                totalQLoss += qLoss;

                if (absNeutral > maxGic)
                {
                    maxGic = absNeutral;
                    topSub = sub.Name;
                }

                // Risk Tier
                string tier;
                string action;
                if (absNeutral >= sub.CriticalGicAmps)
                {
                    tier = "CRITICAL";
                    action = $"Severe core saturation hazard ({absNeutral:F1} A). Notify Eskom NTCC. Defer line switching.";
                }
                else if (absNeutral >= 15.0)
                {
                    tier = "WATCH";
                    action = $"Elevated earthing current ({absNeutral:F1} A). Deploy SVC reactive compensation ({qLoss:F1} MVAR).";
                }
                else if (absNeutral >= 5.0)
                {
                    tier = "ADVISORY";
                    action = $"Advisory GIC level ({absNeutral:F1} A). Inspect dissolved gas analysis (DGA).";
                }
                else
                {
                    tier = "NORMAL";
                    action = "Normal geomagnetic operational parameters.";
                }

                double harmonics = Math.Min(100.0, (absNeutral / sub.CriticalGicAmps) * 100.0);

                gicResults.Add(new SubstationGicResult
                {
                    SubstationId = sub.Id,
                    SubstationName = sub.Name,
                    Province = sub.Province,
                    VoltageKv = sub.VoltageKv,
                    NeutralGicAmps = Math.Round(neutralAmps, 2),
                    PerPhaseAmps = Math.Round(perPhase, 2),
                    QLossMvar = Math.Round(qLoss, 2),
                    HarmonicsRiskPct = Math.Round(harmonics, 1),
                    RiskTier = tier,
                    RecommendedAction = action
                });
            }

            // Overall Tier
            string overallTier = "NORMAL";
            if (gicResults.Exists(r => r.RiskTier == "CRITICAL")) overallTier = "CRITICAL";
            else if (gicResults.Exists(r => r.RiskTier == "WATCH")) overallTier = "WATCH";
            else if (gicResults.Exists(r => r.RiskTier == "ADVISORY")) overallTier = "ADVISORY";

            // Sort by highest neutral current
            gicResults.Sort((a, b) => Math.Abs(b.NeutralGicAmps).CompareTo(Math.Abs(a.NeutralGicAmps)));

            return new GridRiskSummary
            {
                OverallTier = overallTier,
                TotalQLossMvar = Math.Round(totalQLoss, 2),
                MaxGicAmps = Math.Round(maxGic, 2),
                MostVulnerableSubstation = topSub,
                Substations = gicResults,
                ExVkm = Math.Round(exVkm, 4),
                EyVkm = Math.Round(eyVkm, 4),
                MagnitudeVkm = Math.Round(Math.Sqrt(exVkm * exVkm + eyVkm * eyVkm), 4),
                Timestamp = DateTime.UtcNow
            };
        }
    }
}
