"""
Geoelectric Field Induction Engine (Plane-Wave & 1D Layered Earth Formulation).

Implements the fundamental electromagnetic induction equations relating geomagnetic field
perturbations (dB/dt, B in nT) to surface geoelectric fields (Ex, Ey in V/km).

References:
- Wait, J. R. (1981). Wave Propagation Theory. Pergamon Press.
- Cagniard, L. (1953). Basic theory of the magneto-telluric method of geophysical prospecting. Geophysics, 18(3), 605-635.
- Pirjola, R. (1982). Electromagnetic induction in the earth by a plane wave or by fields of line currents.
- Ngwira, C. M., et al. (2009). Modeling geomagnetically induced currents in the South African electric power network.
"""

import numpy as np
from typing import List, Tuple, Optional
from data.conductivity_models import RegionalConductivityModel, KAAPVAAL_CRATON_MODEL

MU_0 = 4.0 * np.pi * 1e-7  # Permeability of free space (H/m = V*s/(A*m))


def calculate_surface_impedance_1d(
    frequencies_hz: np.ndarray,
    model: RegionalConductivityModel
) -> np.ndarray:
    """
    Computes the frequency-dependent surface impedance Z(omega) for a 1D horizontally
    stratified Earth using Wait's recursive formula.

    Args:
        frequencies_hz: 1D array of positive frequencies in Hz.
        model: RegionalConductivityModel with layered thicknesses and resistivities.

    Returns:
        Complex array of surface impedances Z_1(omega) in Ohms (V/A = Ohm).
    """
    omega = 2.0 * np.pi * frequencies_hz
    n_freq = len(frequencies_hz)
    z_surf = np.zeros(n_freq, dtype=complex)

    for i, w in enumerate(omega):
        if w <= 1e-12:
            z_surf[i] = 0.0 + 0.0j
            continue

        layers = model.layers
        n_layers = len(layers)

        # Bottom layer (infinite half-space)
        bottom_sigma = 1.0 / max(layers[-1].resistivity_ohm_m, 1e-6)
        k_bottom = np.sqrt(1j * w * MU_0 * bottom_sigma)
        z_current = 1j * w * MU_0 / k_bottom  # Characteristic impedance of halfspace

        # Recurse upward from N-1 down to 1 (surface)
        for j in range(n_layers - 2, -1, -1):
            h = layers[j].thickness_km * 1000.0  # convert km to meters
            sigma = 1.0 / max(layers[j].resistivity_ohm_m, 1e-6)
            k = np.sqrt(1j * w * MU_0 * sigma)
            eta = 1j * w * MU_0 / k  # Characteristic impedance of layer j

            kh = k * h
            # Guard against tanh overflow with large arguments
            if np.real(kh) > 35.0:
                tanh_kh = 1.0 + 0.0j
            else:
                tanh_kh = np.tanh(kh)

            # Wait's recurrence relation
            numerator = z_current + eta * tanh_kh
            denominator = eta + z_current * tanh_kh
            z_current = eta * (numerator / denominator)

        z_surf[i] = z_current

    return z_surf


def compute_geoelectric_field_fft(
    bx_nt: np.ndarray,
    by_nt: np.ndarray,
    dt_seconds: float = 60.0,
    model: RegionalConductivityModel = KAAPVAAL_CRATON_MODEL
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Converts horizontal geomagnetic field time-series (Bx, By) in nT into
    horizontal surface geoelectric field components (Ex, Ey) in V/km via FFT.

    Plane-wave Magnetotelluric relations:
        Ex(omega) =  (Z(omega) / mu_0) * By(omega)
        Ey(omega) = -(Z(omega) / mu_0) * Bx(omega)

    Args:
        bx_nt: Northward geomagnetic field variation in nanoteslas (nT).
        by_nt: Eastward geomagnetic field variation in nanoteslas (nT).
        dt_seconds: Sampling time step in seconds (default 60s for 1-minute data).
        model: Regional conductivity profile.

    Returns:
        (Ex, Ey) tuple of 1D numpy arrays in V/km (volts per kilometer).
    """
    n_samples = len(bx_nt)
    if n_samples < 2:
        return np.zeros_like(bx_nt), np.zeros_like(by_nt)

    # Detrend data to avoid spectral leakage from DC offsets
    bx_detrend = bx_nt - np.mean(bx_nt)
    by_detrend = by_nt - np.mean(by_nt)

    # Apply Tukey / cosine taper to smooth window boundaries
    taper = np.ones(n_samples)
    taper_len = min(int(n_samples * 0.05), 50)
    if taper_len > 0:
        window = 0.5 * (1.0 - np.cos(np.linspace(0, np.pi, taper_len)))
        taper[:taper_len] = window
        taper[-taper_len:] = window[::-1]

    bx_windowed = bx_detrend * taper
    by_windowed = by_detrend * taper

    # Convert nT to Tesla: 1 nT = 1e-9 T
    bx_tesla = bx_windowed * 1e-9
    by_tesla = by_windowed * 1e-9

    # Real Fast Fourier Transform
    fft_bx = np.fft.rfft(bx_tesla)
    fft_by = np.fft.rfft(by_tesla)
    frequencies = np.fft.rfftfreq(n_samples, d=dt_seconds)

    # Compute surface impedance transfer function Z(omega)
    z_omega = calculate_surface_impedance_1d(frequencies, model)

    # Transfer function: E(omega) = (Z / mu_0) * B(omega)
    # Z / mu_0 has units: (Ohm) / (V*s/(A*m)) = (V/A) / (V*s/(A*m)) = m/s
    # When multiplied by B (Tesla = V*s/m^2), result is in V/m
    transfer_factor = z_omega / MU_0

    fft_ex = transfer_factor * fft_by
    fft_ey = -transfer_factor * fft_bx

    # Inverse Real FFT -> time domain in V/m
    ex_v_per_m = np.fft.irfft(fft_ex, n=n_samples)
    ey_v_per_m = np.fft.irfft(fft_ey, n=n_samples)

    # Convert V/m to V/km: 1 V/m = 1000 V/km
    ex_v_per_km = ex_v_per_m * 1000.0
    ey_v_per_km = ey_v_per_m * 1000.0

    return ex_v_per_km, ey_v_per_km


def instantaneous_efield_estimate(
    dbx_dt_nt_per_min: float,
    dby_dt_nt_per_min: float,
    effective_resistivity_ohm_m: float = 1000.0
) -> Tuple[float, float, float]:
    """
    Rapid, instantaneous approximation of induced geoelectric field from rate of change of B
    (dB/dt in nT/min), useful for low-latency streaming alert triggers before full FFT buffers.

    Approximation based on skin depth and Faraday's law:
        |E| ~ sqrt(rho) * (dB/dt) * scaling_constant

    Returns:
        (Ex_v_km, Ey_v_km, E_total_v_km)
    """
    # Convert nT/min to nT/sec
    dbx_sec = dbx_dt_nt_per_min / 60.0
    dby_sec = dby_dt_nt_per_min / 60.0

    # Empirical calibration constant derived from Southern African MT transfer functions (Ngwira 2009)
    # At ~1000-3000 Ohm-m, 100 nT/min typical rate produces ~1-2 V/km peak electric field
    k_scale = 1.2e-4 * np.sqrt(max(effective_resistivity_ohm_m, 10.0))

    # Orthogonal Faraday relationship (Ex ~ dBy/dt, Ey ~ -dBx/dt)
    ex = k_scale * dby_sec
    ey = -k_scale * dbx_sec
    e_tot = float(np.hypot(ex, ey))

    return float(ex), float(ey), e_tot
