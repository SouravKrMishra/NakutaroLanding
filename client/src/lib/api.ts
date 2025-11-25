// API configuration utility
// In production, if frontend and backend are on same domain, use relative URLs
// If on different domains, set VITE_API_BASE_URL environment variable
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return API_BASE_URL
    ? `${API_BASE_URL}/${cleanEndpoint}`
    : `/${cleanEndpoint}`;
};
