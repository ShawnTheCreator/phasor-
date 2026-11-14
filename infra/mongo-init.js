// MongoDB Initialization Script for Phasor Space Weather Platform
db = db.getSiblingDB('phasor_spaceweather');

db.createCollection('solar_wind_telemetry');
db.createCollection('grid_risk_assessments');
db.createCollection('alerts');
db.createCollection('operational_directives');
db.createCollection('transformer_assets');
db.createCollection('ground_magnetometer');

// Create indexes for efficient time-series queries
db.solar_wind_telemetry.createIndex({ "timestamp": -1 });
db.grid_risk_assessments.createIndex({ "timestamp": -1 });
db.alerts.createIndex({ "createdAt": -1, "isAcknowledged": 1 });
db.ground_magnetometer.createIndex({ "timestamp": -1 });

print("Phasor database collections and indexes initialized successfully.");
