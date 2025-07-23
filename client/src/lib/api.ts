// API configuration utility
export const API_BASE_URL = import.meta.env.DEV
  ? "" // Use relative URLs in development (will use Vite proxy)
  : import.meta.env.VITE_API_BASE_URL || ""; // Use environment variable in production

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return API_BASE_URL
    ? `${API_BASE_URL}/${cleanEndpoint}`
    : `/${cleanEndpoint}`;
};
