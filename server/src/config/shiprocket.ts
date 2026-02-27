// Shiprocket API Configuration
// Documentation: https://apidocs.shiprocket.in/
// Track AWB: GET https://apiv2.shiprocket.in/v1/external/courier/track/awb/{awb_code}
// Uses getters so credentials are read at runtime (works when .env is loaded after this module).

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";

export const shiprocketConfig = {
  get baseUrl(): string {
    return process.env.SHIPROCKET_BASE_URL || SHIPROCKET_BASE;
  },

  get email(): string {
    return process.env.SHIPROCKET_EMAIL || "";
  },
  get password(): string {
    return process.env.SHIPROCKET_PASSWORD || "";
  },

  tokenRefreshInterval: 9 * 24 * 60 * 60 * 1000, // 9 days in milliseconds

  get defaultPickupPincode(): string {
    return process.env.SHIPROCKET_PICKUP_PINCODE || "110068";
  },
  /** Pickup location name - must exactly match a location in Shiprocket dashboard (Settings > Pickup Addresses) */
  get pickupLocationName(): string {
    return process.env.SHIPROCKET_PICKUP_LOCATION || "Primary";
  },
  get defaultWeight(): number {
    return parseFloat(process.env.SHIPROCKET_DEFAULT_WEIGHT || "0.5");
  },

  isConfigured(): boolean {
    return Boolean(this.email && this.password);
  },
};
