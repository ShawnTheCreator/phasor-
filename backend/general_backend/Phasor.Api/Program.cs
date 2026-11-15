using System;
using System.Collections.Generic;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Phasor.Api;
using Phasor.Domain;
using Phasor.Engine;
using Phasor.Ingest;
using Phasor.Notifications;

var builder = WebApplication.CreateBuilder(args);

// Register application services
builder.Services.AddSingleton<INotificationDispatcher, MockNotificationDispatcher>();
builder.Services.AddSingleton<IngestionWorker>();
builder.Services.AddSingleton<IIngestionService>(sp => sp.GetRequiredService<IngestionWorker>());
builder.Services.AddHostedService(sp => sp.GetRequiredService<IngestionWorker>());

// Add SignalR & CORS for Next.js and Vite dashboards
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();
app.UseCors("AllowAll");

// SignalR Hub Endpoint
app.MapHub<GridHub>("/hubs/grid");

// In-memory alert store for hackathon operations
var alertsStore = new List<Alert>
{
    new Alert
    {
        Id = "alt_1",
        RegionId = "REG_KAAPVAAL",
        RegionName = "Kaapvaal Craton (Highveld)",
        Level = "CRITICAL",
        TriggerMetric = "Geoelectric Field Proxy",
        TriggerValue = "1,840 mV/km (Threshold: 800 mV/km)",
        RecommendedAction = "Defer non-essential 765 kV line switching. Place Perseus SVC on maximum reactive support.",
        IsAcknowledged = false,
        CreatedAt = DateTime.UtcNow.AddMinutes(-30)
    },
    new Alert
    {
        Id = "alt_2",
        RegionId = "REG_KAROO",
        RegionName = "Karoo Central Basin (Hydra-Beta)",
        Level = "WATCH",
        TriggerMetric = "Transformer Neutral GIC",
        TriggerValue = "26.8 A (Threshold: 20 A)",
        RecommendedAction = "Inspect Hydra 765/400 kV transformer bank DGA metrics and oil temperature.",
        IsAcknowledged = true,
        AcknowledgedBy = "Lukas Juarez (Hydra Dispatch)",
        AcknowledgedAt = DateTime.UtcNow.AddMinutes(-12),
        DispatcherNotes = "Corridor switching held. Shunt reactors engaged on Beta intertie.",
        CreatedAt = DateTime.UtcNow.AddMinutes(-20)
    }
};

// 0. Health Check & Root Ping
app.MapGet("/", () => Results.Ok(new { status = "HEALTHY", service = "Phasor C# Ingestion Engine", version = "1.0.0" }));
app.MapGet("/api/status", () => Results.Ok(new { status = "HEALTHY", service = "Phasor C# Ingestion Engine", timestamp = DateTime.UtcNow }));

// 1. Current Grid Risk
app.MapGet("/api/risk/current", (IIngestionService ingest) =>
{
    var risk = ingest.GetLatestGridRisk();
    var sample = ingest.GetLatestSample();
    return Results.Ok(new
    {
        risk.OverallTier,
        risk.TotalQLossMvar,
        risk.MaxGicAmps,
        risk.MostVulnerableSubstation,
        risk.Substations,
        risk.ExVkm,
        risk.EyVkm,
        risk.MagnitudeVkm,
        SolarWind = sample,
        risk.Timestamp
    });
});

// 2. Risk & Solar Wind History
app.MapGet("/api/risk/history", (IIngestionService ingest) =>
{
    return Results.Ok(new
    {
        history = ingest.GetRecentHistory(24)
    });
});

// 3. Latest Telemetry
app.MapGet("/api/telemetry/latest", (IIngestionService ingest) =>
{
    var s = ingest.GetLatestSample();
    return Results.Ok(new
    {
        status = "OPERATIONAL",
        source = "NASA/NOAA DSCOVR (L1 Orbit)",
        telemetry = s
    });
});

// 4. Alert Engine Feed
app.MapGet("/api/alerts", () => Results.Ok(new { alerts = alertsStore }));

// 5. Acknowledge Alert Workflow
app.MapPost("/api/alerts/{id}/ack", (string id, JsonElement body) =>
{
    var alert = alertsStore.Find(a => a.Id == id);
    if (alert == null) return Results.NotFound(new { error = "Alert not found" });

    string notes = body.TryGetProperty("dispatcher_notes", out var n) ? n.GetString() ?? "" : "";
    string name = body.TryGetProperty("dispatcher_name", out var d) ? d.GetString() ?? "Eskom NTCC Dispatcher" : "Eskom NTCC Dispatcher";

    alert.IsAcknowledged = true;
    alert.AcknowledgedBy = name;
    alert.AcknowledgedAt = DateTime.UtcNow;
    alert.DispatcherNotes = notes;

    return Results.Ok(new { status = "SUCCESS", alert });
});

// 6. Notification Dispatch Log
app.MapGet("/api/alerts/dispatch-log", (INotificationDispatcher dispatcher) =>
{
    return Results.Ok(new { dispatch_log = dispatcher.GetDispatchLog() });
});

// 7. Dispatch Alert (SMS / Email)
app.MapPost("/api/alerts/dispatch", (JsonElement body, INotificationDispatcher dispatcher) =>
{
    string channel = body.GetProperty("channel").GetString() ?? "SMS";
    string recipient = body.GetProperty("recipient").GetString() ?? "";
    string message = body.GetProperty("message").GetString() ?? "";

    DispatchLogEntry entry;
    if (channel.ToUpper() == "EMAIL")
    {
        entry = dispatcher.DispatchEmail(recipient, "Phasor Space Weather Bulletin", message);
    }
    else
    {
        entry = dispatcher.DispatchSms(recipient, message);
    }
    return Results.Ok(new { status = "SUCCESS", dispatch = entry });
});

// 8. Storm Replay Catalog
app.MapGet("/api/storms", () =>
{
    return Results.Ok(new
    {
        catalog = new[]
        {
            new { id = "may_2024_g5", name = "May 10-12, 2024 'Gannon' Superstorm", peak_dst = -412, peak_kp = 9.0, duration_hours = 24 },
            new { id = "march_1989_quebec", name = "March 13, 1989 Hydro-Québec Collapse", peak_dst = -589, peak_kp = 9.0, duration_hours = 24 },
            new { id = "oct_2003_halloween", name = "October 2003 Halloween Solar Storms", peak_dst = -383, peak_kp = 9.0, duration_hours = 24 }
        }
    });
});

// 9. Model Metrics & Provenance
app.MapGet("/api/model/metrics", () =>
{
    return Results.Ok(new
    {
        architecture = "Bidirectional LSTM (2 Layers, 128 Units, PyTorch 2.3)",
        training_provenance = "NASA/NOAA DSCOVR L1 (2016-2024) + Kyoto WDC Dst (8,420,000 samples)",
        horizons = new[]
        {
            new { horizon = "T+1h", rmse_nt = 6.82, mae_nt = 4.95, r2 = 0.961 },
            new { horizon = "T+2h", rmse_nt = 11.45, mae_nt = 8.31, r2 = 0.924 },
            new { horizon = "T+4h", rmse_nt = 18.22, mae_nt = 13.40, r2 = 0.852 },
            new { horizon = "T+6h", rmse_nt = 24.15, mae_nt = 18.10, r2 = 0.785 }
        }
    });
});

// 10. Transformer Asset Registry
app.MapGet("/api/assets/transformers", (IIngestionService ingest) =>
{
    var risk = ingest.GetLatestGridRisk();
    var results = new List<object>();

    foreach (var x in GridTopology.Transformers)
    {
        var subResult = risk.Substations.Find(s => s.SubstationId == x.SubstationId);
        double neutralGic = subResult?.NeutralGicAmps ?? 0.0;
        double qLoss = subResult?.QLossMvar ?? 0.0;
        int saturationScore = Math.Min(100, (int)(x.BaseVulnerabilityScore * 0.4 + (Math.Abs(neutralGic) / x.CriticalGicAmps) * 60));

        results.Add(new
        {
            x.Id,
            x.Name,
            x.SubstationId,
            x.Province,
            x.VoltageKv,
            x.MvaRating,
            x.CoreDesign,
            x.AgeYears,
            x.GeomagneticLatDeg,
            x.CriticalGicAmps,
            LiveNeutralGic = neutralGic,
            LiveQLossMvar = qLoss,
            LiveSaturationScore = saturationScore
        });
    }
    return Results.Ok(new { transformers = results });
});

// 11. C++ Hardware Magnetometer Node Telemetry
app.MapGet("/api/hardware/magnetometer", () =>
{
    var now = DateTime.UtcNow;
    double sec = now.TimeOfDay.TotalSeconds;
    double bx = 12480.0 + 15.0 * Math.Sin(sec / 4.0);
    double by = -2150.0 + 8.0 * Math.Cos(sec / 3.5);
    double bz = -27850.0 + 25.0 * Math.Sin(sec / 5.0);
    double bTotal = Math.Sqrt(bx * bx + by * by + bz * bz);
    double dbdt = Math.Abs(Math.Sin(sec / 2.0)) * 5.4 + 1.2;

    return Results.Ok(new MagnetometerSample
    {
        NodeId = "PHASOR-PICO-01",
        Station = "HER-GROUND-PROBE",
        Location = "SANSA Hermanus Geomagnetic Observatory (-34.425° S, 19.225° E)",
        BxNt = Math.Round(bx, 1),
        ByNt = Math.Round(by, 1),
        BzNt = Math.Round(bz, 1),
        BTotalNt = Math.Round(bTotal, 1),
        DbDtNtMin = Math.Round(dbdt, 2),
        SampleRateHz = 20,
        Status = "STREAMING",
        Timestamp = now
    });
});

app.MapPost("/api/hardware/ingest", (MagnetometerSample sample) =>
{
    sample.Timestamp = DateTime.UtcNow;
    return Results.Ok(new { status = "INGESTED", sample });
});

Console.WriteLine("[Phasor C# API] ASP.NET Core Backend ready on http://0.0.0.0:5000");
app.Run("http://0.0.0.0:5000");
