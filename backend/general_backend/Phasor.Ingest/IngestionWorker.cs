using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Phasor.Domain;
using Phasor.Engine;

namespace Phasor.Ingest
{
    public interface IIngestionService
    {
        SolarWindSample GetLatestSample();
        GridRiskSummary GetLatestGridRisk();
        List<SolarWindSample> GetRecentHistory(int count = 24);
    }

    public class IngestionWorker : BackgroundService, IIngestionService
    {
        private readonly ILogger<IngestionWorker> _logger;
        private readonly HttpClient _httpClient;
        private SolarWindSample _latestSample;
        private GridRiskSummary _latestGridRisk;
        private readonly List<SolarWindSample> _history = new();
        private readonly object _lock = new();

        private static readonly string NoaaPlasmaUrl = Environment.GetEnvironmentVariable("NOAA_PLASMA_URL") ?? "https://services.swpc.noaa.gov/products/solar-wind/plasma-5-minute.json";
        private static readonly string NoaaMagUrl = Environment.GetEnvironmentVariable("NOAA_MAG_URL") ?? "https://services.swpc.noaa.gov/products/solar-wind/mag-5-minute.json";

        public IngestionWorker(ILogger<IngestionWorker> logger)
        {
            _logger = logger;
            _httpClient = new HttpClient { Timeout = TimeSpan.FromSeconds(3) };

            // Initialize baseline
            _latestSample = new SolarWindSample
            {
                SpeedKmS = 445.0,
                DensityNCm3 = 5.2,
                ImfBz = -4.2,
                ImfBy = 2.1,
                ImfBx = 3.0,
                DynamicPressureNpa = 1.72,
                TemperatureK = 95000,
                LeadTimeMinutes = 28.1,
                CouplingProxyVbz = 1869.0,
                Timestamp = DateTime.UtcNow
            };

            var (ex, ey, _) = PhysicsEngine.EstimateGeoelectricField(9.5 * 0.75, 9.5 * 0.85, 2000.0);
            _latestGridRisk = PhysicsEngine.SolveGridGic(ex, ey, GridTopology.Substations);
        }

        public SolarWindSample GetLatestSample()
        {
            lock (_lock) return _latestSample;
        }

        public GridRiskSummary GetLatestGridRisk()
        {
            lock (_lock) return _latestGridRisk;
        }

        public List<SolarWindSample> GetRecentHistory(int count = 24)
        {
            lock (_lock)
            {
                int take = Math.Min(count, _history.Count);
                return _history.GetRange(_history.Count - take, take);
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Phasor Real-Time DSCOVR / Ingestion Worker Started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    SolarWindSample? sample = await PollNoaaSwpcAsync();
                    if (sample == null)
                    {
                        sample = GenerateDynamicSample();
                    }

                    // Physics Engine: Compute geoelectric induction & solve GIC network
                    double bzCoupling = Math.Max(0.0, -sample.ImfBz) * 2.2;
                    double dbDt = 8.0 + (sample.SpeedKmS / 100.0) * 3.5 + bzCoupling;

                    var (ex, ey, _) = PhysicsEngine.EstimateGeoelectricField(dbDt * 0.72, dbDt * 0.88, 2000.0);
                    var gridRisk = PhysicsEngine.SolveGridGic(ex, ey, GridTopology.Substations);

                    lock (_lock)
                    {
                        _latestSample = sample;
                        _latestGridRisk = gridRisk;
                        _history.Add(sample);
                        if (_history.Count > 1440) _history.RemoveAt(0);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning("Ingestion tick warning: {Message}", ex.Message);
                }

                await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
            }
        }

        private async Task<SolarWindSample?> PollNoaaSwpcAsync()
        {
            try
            {
                var plasmaTask = _httpClient.GetStringAsync(NoaaPlasmaUrl);
                var magTask = _httpClient.GetStringAsync(NoaaMagUrl);
                await Task.WhenAll(plasmaTask, magTask);

                using var plasmaDoc = JsonDocument.Parse(plasmaTask.Result);
                using var magDoc = JsonDocument.Parse(magTask.Result);

                var plasmaRoot = plasmaDoc.RootElement;
                var magRoot = magDoc.RootElement;

                if (plasmaRoot.GetArrayLength() > 1 && magRoot.GetArrayLength() > 1)
                {
                    var lastPlasma = plasmaRoot[plasmaRoot.GetArrayLength() - 1];
                    var lastMag = magRoot[magRoot.GetArrayLength() - 1];

                    double speed = double.TryParse(lastPlasma[2].GetString(), out var s) ? s : 440.0;
                    double dens = double.TryParse(lastPlasma[1].GetString(), out var d) ? d : 5.0;
                    double bz = double.TryParse(lastMag[3].GetString(), out var b) ? b : -2.5;

                    double leadTime = Math.Round((1.5e6 / Math.Max(speed, 100.0)) / 60.0, 1);
                    double pDyn = Math.Round(1.67e-6 * dens * (speed * speed), 2);
                    double coupling = Math.Round(speed * Math.Max(0.0, -bz), 1);

                    return new SolarWindSample
                    {
                        SpeedKmS = speed,
                        DensityNCm3 = dens,
                        ImfBz = bz,
                        DynamicPressureNpa = pDyn,
                        TemperatureK = 92000,
                        LeadTimeMinutes = leadTime,
                        CouplingProxyVbz = coupling,
                        Timestamp = DateTime.UtcNow
                    };
                }
            }
            catch
            {
                // Offline fallback
                return null;
            }
            return null;
        }

        private SolarWindSample GenerateDynamicSample()
        {
            double t = (DateTime.UtcNow - DateTime.UnixEpoch).TotalSeconds;
            double speed = Math.Round(445.0 + 15.0 * Math.Sin(t / 40.0), 1);
            double dens = Math.Round(5.2 + 0.8 * Math.Cos(t / 35.0), 1);
            double bz = Math.Round(-4.2 + 2.5 * Math.Sin(t / 25.0), 2);

            double leadTime = Math.Round((1.5e6 / Math.Max(speed, 100.0)) / 60.0, 1);
            double pDyn = Math.Round(1.67e-6 * dens * (speed * speed), 2);
            double coupling = Math.Round(speed * Math.Max(0.0, -bz), 1);

            return new SolarWindSample
            {
                SpeedKmS = speed,
                DensityNCm3 = dens,
                ImfBz = bz,
                DynamicPressureNpa = pDyn,
                TemperatureK = 95000,
                LeadTimeMinutes = leadTime,
                CouplingProxyVbz = coupling,
                Timestamp = DateTime.UtcNow
            };
        }
    }
}
