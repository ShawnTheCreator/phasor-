/**
 * Centralized API configuration for local and cloud production (Vercel / Render).
 */
export const API_BASE_URL: string =
  (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : '') ||
  'http://localhost:8000';

export const DOTNET_BASE_URL: string =
  (process.env.NEXT_PUBLIC_DOTNET_URL ? process.env.NEXT_PUBLIC_DOTNET_URL.replace(/\/$/, '') : '') ||
  (process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '') : '') ||
  'http://localhost:5000';
