using System;
using System.Collections.Generic;

namespace Phasor.Domain
{
    public class SolarWindSample
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public double ImfBx { get; set; }
        public double ImfBy { get; set; }
        public double ImfBz { get; set; }
        public double SpeedKmS { get; set; }
        public double DensityNCm3 { get; set; }
        public double DynamicPressureNpa { get; set; }
        public double TemperatureK { get; set; }
        public double LeadTimeMinutes { get; set; }
        public double CouplingProxyVbz { get; set; }
    }

    public class RiskReading
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string RegionId { get; set; } = string.Empty;
        public string RegionName { get; set; } = string.Empty;
        public double EFieldMvKm { get; set; }
        public double ThresholdMvKm { get; set; }
        public string RiskTier { get; set; } = "NORMAL";
        public double EffectiveResistivityOhmM { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class Alert
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string RegionId { get; set; } = string.Empty;
        public string RegionName { get; set; } = string.Empty;
        public string Level { get; set; } = "ADVISORY"; // ADVISORY, WATCH, CRITICAL
        public string TriggerMetric { get; set; } = string.Empty;
        public string TriggerValue { get; set; } = string.Empty;
        public string RecommendedAction { get; set; } = string.Empty;
        public bool IsAcknowledged { get; set; } = false;
        public string? AcknowledgedBy { get; set; }
        public DateTime? AcknowledgedAt { get; set; }
        public string? DispatcherNotes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Substation
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public double VoltageKv { get; set; }
        public double EarthingResistanceOhms { get; set; }
        public double CriticalGicAmps { get; set; }
    }

    public class SubstationGicResult
    {
        public string SubstationId { get; set; } = string.Empty;
        public string SubstationName { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public double VoltageKv { get; set; }
        public double NeutralGicAmps { get; set; }
        public double PerPhaseAmps { get; set; }
        public double QLossMvar { get; set; }
        public double HarmonicsRiskPct { get; set; }
        public string RiskTier { get; set; } = "NORMAL";
        public string RecommendedAction { get; set; } = string.Empty;
    }

    public class GridRiskSummary
    {
        public string OverallTier { get; set; } = "NORMAL";
        public double TotalQLossMvar { get; set; }
        public double MaxGicAmps { get; set; }
        public string MostVulnerableSubstation { get; set; } = string.Empty;
        public List<SubstationGicResult> Substations { get; set; } = new();
        public double ExVkm { get; set; }
        public double EyVkm { get; set; }
        public double MagnitudeVkm { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class TransformerAsset
    {
        public string Id { get; set; } = string.Empty;
        public string SubstationId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Province { get; set; } = string.Empty;
        public double VoltageKv { get; set; }
        public int MvaRating { get; set; }
        public string CoreDesign { get; set; } = string.Empty;
        public int AgeYears { get; set; }
        public double GeomagneticLatDeg { get; set; }
        public double NeutralResistanceOhms { get; set; }
        public double CriticalGicAmps { get; set; }
        public int BaseVulnerabilityScore { get; set; }
        public string MitigationEquipment { get; set; } = string.Empty;
    }

    public class DispatchLogEntry
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Channel { get; set; } = "SMS"; // SMS, EMAIL
        public string Recipient { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime DispatchedAt { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "DELIVERED";
    }

    public class OperationalDirective
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool Checked { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class MagnetometerSample
    {
        public string NodeId { get; set; } = "PHASOR-PICO-01";
        public string Station { get; set; } = "HER-GROUND-PROBE";
        public string Location { get; set; } = "SANSA Hermanus Observatory (-34.425° S, 19.225° E)";
        public double BxNt { get; set; } = 12480.0;
        public double ByNt { get; set; } = -2150.0;
        public double BzNt { get; set; } = -27850.0;
        public double BTotalNt { get; set; } = 30588.0;
        public double DbDtNtMin { get; set; } = 2.45;
        public int SampleRateHz { get; set; } = 20;
        public string Status { get; set; } = "STREAMING";
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
