// API configuration utility
// Prefer explicit env variable if provided (works in both dev and prod)
export const API_BASE_URL = import.meta.env.DEV ? "" : "";

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return API_BASE_URL
    ? `${API_BASE_URL}/${cleanEndpoint}`
    : `/${cleanEndpoint}`;
};
