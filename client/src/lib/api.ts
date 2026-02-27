// API configuration utility
// API requests must go to the BACKEND server, not the frontend origin.
// - Development: set VITE_API_BASE_URL or VITE_API_URL to your backend (e.g. http://localhost:5000)
//   so requests hit the backend. If unset, relative URLs are used (Vite proxy forwards /api to backend).
// - Production: set VITE_API_BASE_URL if backend is on another domain.
export const API_BASE_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "")
  : (import.meta.env.VITE_API_BASE_URL || "https://backend.animeindia.org");

// Build full URL for API calls (always targets backend, never Shiprocket directly from client)
export const buildApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return API_BASE_URL
    ? `${API_BASE_URL.replace(/\/$/, "")}/${cleanEndpoint}`
    : `/${cleanEndpoint}`;
};
