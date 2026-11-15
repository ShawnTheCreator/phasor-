using System;
using System.Collections.Generic;
using System.Numerics;
using Phasor.Engine;
using Xunit;

namespace Phasor.Tests
{
    public class PhysicsEngineTests
    {
        [Fact]
        public void TestWaitImpedanceCalculatesCorrectly()
        {
            double[] thicknesses = new[] { 10.0, 30.0, 0.0 };
            double[] resistivities = new[] { 2000.0, 10000.0, 100.0 };

            double omega = 2.0 * Math.PI * 0.001; // 1 mHz
            Complex z = PhysicsEngine.ComputeWaitImpedance(omega, thicknesses, resistivities);

            Assert.True(z.Real > 0.0, "Surface impedance real part must be positive");
            Assert.True(z.Imaginary > 0.0, "Surface impedance imaginary part must be positive");
        }

        [Fact]
        public void TestKirchhoffCurrentConservation()
        {
            // Compute GIC solution with E = 1.2 V/km East, -0.8 V/km North
            var summary = PhysicsEngine.SolveGridGic(1.2, -0.8, GridTopology.Substations);

            Assert.NotNull(summary);
            Assert.Equal(13, summary.Substations.Count);

            double sumNeutralAmps = 0.0;
            foreach (var sub in summary.Substations)
            {
                sumNeutralAmps += sub.NeutralGicAmps;
            }

            // Sum of all neutral ground currents must be zero within floating point rounding
            Assert.True(Math.Abs(sumNeutralAmps) < 0.05, $"Kirchhoff violation: Sum is {sumNeutralAmps} A");
        }

        [Fact]
        public void TestReactivePowerDeficitPositive()
        {
            var summary = PhysicsEngine.SolveGridGic(2.5, -1.5, GridTopology.Substations);
            Assert.True(summary.TotalQLossMvar > 0.0, "Total reactive power loss Q_loss must be positive during storm");
            Assert.True(summary.MaxGicAmps > 0.0, "Max GIC amplitude must be positive");
        }
    }
}
