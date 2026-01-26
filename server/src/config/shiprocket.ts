// Shiprocket API Configuration
// Documentation: https://apidocs.shiprocket.in/

export const shiprocketConfig = {
  // API Base URL
  baseUrl: "https://apiv2.shiprocket.in/v1/external",

  // Credentials from environment variables
  email: process.env.SHIPROCKET_EMAIL || "",
  password: process.env.SHIPROCKET_PASSWORD || "",

  // Token validity is 10 days (240 hours), but we refresh after 9 days to be safe
  tokenRefreshInterval: 9 * 24 * 60 * 60 * 1000, // 9 days in milliseconds

  // Default pickup pincode (your warehouse/store pincode)
  defaultPickupPincode: process.env.SHIPROCKET_PICKUP_PINCODE || "110068",

  // Default weight for serviceability check (in kg)
  defaultWeight: parseFloat(process.env.SHIPROCKET_DEFAULT_WEIGHT || "0.5"),

  // Check if Shiprocket is properly configured
  isConfigured(): boolean {
    return Boolean(this.email && this.password);
  },
} as const;
