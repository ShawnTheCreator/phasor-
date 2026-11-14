#ifndef RM3100_H
#define RM3100_H

#include <stdint.h>

/**
 * @brief Register map and driver constants for PNI RM3100 3-Axis Magneto-Inductive Sensor.
 * Sensitivity: ~75 LSB/nT (Cycle count = 200).
 */
#define RM3100_I2C_ADDRESS    0x20

#define RM3100_REG_CCX1       0x04  // Cycle Count X MSB
#define RM3100_REG_CCX0       0x05  // Cycle Count X LSB
#define RM3100_REG_CCY1       0x06
#define RM3100_REG_CCY0       0x07
#define RM3100_REG_CCZ1       0x08
#define RM3100_REG_CCZ0       0x09
#define RM3100_REG_CMM        0x01  // Continuous Measurement Mode
#define RM3100_REG_STATUS     0x34  // DRDY Status
#define RM3100_REG_MEAS_X2    0x24  // Measurement Results (24-bit 2's complement)

struct MagSample {
    float bx_nt;
    float by_nt;
    float bz_nt;
    float b_total_nt;
    float db_dt_nt_min;
    uint32_t timestamp_ms;
    bool data_valid;
};

#endif // RM3100_H
