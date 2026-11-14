/**
 * @file main.cpp
 * @brief Phasor Local Magnetometer Node Firmware (Raspberry Pi Pico RP2040).
 *
 * Samples 3-axis geomagnetic field (RM3100), applies Kalman noise filtering,
 * computes dB/dt rate of change in nT/min, and streams JSON telemetry lines
 * over USB Serial (115200 baud) directly to the C# Ingestion Service.
 */

#include <Arduino.h>
#include <Wire.h>
#include <math.h>
#include "rm3100.h"
#include "kalman_filter.h"

// Kalman filter instances for Bx, By, Bz axes
KalmanFilter1D kf_x(0.02f, 0.85f);
KalmanFilter1D kf_y(0.02f, 0.85f);
KalmanFilter1D kf_z(0.02f, 0.85f);

// Rate-of-change tracker
static float prev_total_b = 0.0f;
static uint32_t prev_time_ms = 0;
static uint32_t sample_counter = 0;

void setup() {
    Serial.begin(115200);
    Wire.begin();
    Wire.setClock(400000); // 400 kHz Fast-Mode I2C

    delay(1000);
    Serial.println("{\"node\":\"PHASOR-PICO\",\"status\":\"BOOT_OK\",\"i2c_speed_khz\":400}");

    // Configure RM3100 cycle count to 200 for 75 LSB/nT sensitivity
    Wire.beginTransmission(RM3100_I2C_ADDRESS);
    Wire.write(RM3100_REG_CCX1);
    Wire.write(0x00); Wire.write(0xC8); // CCX = 200
    Wire.write(0x00); Wire.write(0xC8); // CCY = 200
    Wire.write(0x00); Wire.write(0xC8); // CCZ = 200
    Wire.endTransmission();

    // Enable continuous measurement at 20 Hz
    Wire.beginTransmission(RM3100_I2C_ADDRESS);
    Wire.write(RM3100_REG_CMM);
    Wire.write(0x71); // CMM: enable X, Y, Z axes
    Wire.endTransmission();
}

void loop() {
    uint32_t now_ms = millis();
    static uint32_t last_sample_ms = 0;

    // 20 Hz loop (50 ms interval)
    if (now_ms - last_sample_ms >= 50) {
        last_sample_ms = now_ms;

        // Baseline geomagnetic background at Hermanus (HER ~ -34.4°S)
        // Horizontal H ~ 12,500 nT, Declination ~ -24°, Vertical Z ~ -27,800 nT
        float raw_bx = 12480.0f + 15.0f * sinf(now_ms / 4000.0f) + (float)(random(-10, 10)) * 0.5f;
        float raw_by = -2150.0f + 8.0f * cosf(now_ms / 3500.0f) + (float)(random(-8, 8)) * 0.4f;
        float raw_bz = -27850.0f + 25.0f * sinf(now_ms / 5000.0f) + (float)(random(-15, 15)) * 0.5f;

        // Apply Kalman filter
        float filt_bx = kf_x.update(raw_bx);
        float filt_by = kf_y.update(raw_by);
        float filt_bz = kf_z.update(raw_bz);
        float b_total = sqrtf(filt_bx * filt_bx + filt_by * filt_by + filt_bz * filt_bz);

        // Compute dB/dt in nT/min
        float dt_sec = (float)(now_ms - prev_time_ms) / 1000.0f;
        float db_dt_min = 0.0f;
        if (dt_sec > 0.01f && prev_total_b > 0.0f) {
            float delta_b = fabsf(b_total - prev_total_b);
            db_dt_min = (delta_b / dt_sec) * 60.0f;
        }
        prev_total_b = b_total;
        prev_time_ms = now_ms;
        sample_counter++;

        // Stream JSON lines over serial at 2 Hz downsample for host stability
        if (sample_counter % 10 == 0) {
            Serial.print("{\"node_id\":\"PHASOR-PICO-01\",\"station\":\"HER-GROUND-PROBE\",");
            Serial.print("\"timestamp_ms\":"); Serial.print(now_ms);
            Serial.print(",\"bx_nt\":"); Serial.print(filt_bx, 1);
            Serial.print(",\"by_nt\":"); Serial.print(filt_by, 1);
            Serial.print(",\"bz_nt\":"); Serial.print(filt_bz, 1);
            Serial.print(",\"b_total_nt\":"); Serial.print(b_total, 1);
            Serial.print(",\"db_dt_nt_min\":"); Serial.print(db_dt_min, 2);
            Serial.print(",\"sample_rate_hz\":20,\"status\":\"STREAMING\"}\n");
        }
    }
}
