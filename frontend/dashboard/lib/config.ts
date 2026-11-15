/**
 * Centralized API configuration for local and cloud production (Vercel / Render).
 * In production, it cleanly defaults to empty string (relative paths or environment variable)
 * so no development localhost URLs or internal ports are ever leaked into client bundles.
 */
const isProduction: boolean = process.env.NODE_ENV === 'production';

export const API_BASE_URL: string =
  (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : '') ||
  (isProduction ? '' : 'http://localhost:8000');

export const DOTNET_BASE_URL: string =
  (process.env.NEXT_PUBLIC_DOTNET_URL ? process.env.NEXT_PUBLIC_DOTNET_URL.replace(/\/$/, '') : '') ||
  (process.env.NEXT_PUBLIC_CSHARP_URL ? process.env.NEXT_PUBLIC_CSHARP_URL.replace(/\/$/, '') : '') ||
  (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : '') ||
  (isProduction ? '' : 'http://localhost:5000');

export const HOME_URL: string =
  (process.env.NEXT_PUBLIC_HOME_URL ? process.env.NEXT_PUBLIC_HOME_URL.replace(/\/$/, '') : '') ||
  (isProduction ? '/' : 'http://localhost:5173');
