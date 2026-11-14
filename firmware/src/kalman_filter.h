#ifndef KALMAN_FILTER_H
#define KALMAN_FILTER_H

/**
 * @brief Discrete 1D Kalman Filter for High-Precision Geomagnetic Sensor Filtering.
 * Suppresses ambient 50 Hz power-line harmonics and thermal measurement jitter.
 */
class KalmanFilter1D {
public:
    KalmanFilter1D(float process_noise = 0.05f, float measurement_noise = 1.2f, float estimation_error = 1.0f)
        : q(process_noise), r(measurement_noise), p(estimation_error), x(0.0f), k(0.0f) {}

    float update(float measurement) {
        // Prediction update
        p = p + q;

        // Measurement update (Kalman Gain)
        k = p / (p + r);
        x = x + k * (measurement - x);
        p = (1.0f - k) * p;

        return x;
    }

    void reset(float initial_value = 0.0f) {
        x = initial_value;
        p = 1.0f;
    }

private:
    float q; // Process noise covariance
    float r; // Measurement noise covariance
    float p; // Estimation error covariance
    float x; // State estimate
    float k; // Kalman gain
};

#endif // KALMAN_FILTER_H
