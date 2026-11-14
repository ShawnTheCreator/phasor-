// MongoDB Initialization Script for Phasor Space Weather Platform (TypeScript definition)
interface MongoCollection {
  createIndex(keys: Record<string, number | string>, options?: Record<string, unknown>): void;
}

interface MongoDatabase {
  getSiblingDB(name: string): MongoDatabase;
  createCollection(name: string): void;
  solar_wind_telemetry: MongoCollection;
  grid_risk_assessments: MongoCollection;
  alerts: MongoCollection;
  operational_directives: MongoCollection;
  transformer_assets: MongoCollection;
  ground_magnetometer: MongoCollection;
}

declare let db: MongoDatabase;
declare function print(message: string): void;

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
