// Shiprocket API Service
// Documentation: https://apidocs.shiprocket.in/

import axios, { AxiosError } from "axios";
import { shiprocketConfig } from "../config/shiprocket.js";

// Token cache for Shiprocket API
interface TokenCache {
  token: string | null;
  expiresAt: number;
}

const tokenCache: TokenCache = {
  token: null,
  expiresAt: 0,
};

// Types for Shiprocket API responses
interface ShiprocketAuthResponse {
  token: string;
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_id: number;
  created_at: string;
}

interface CourierCompany {
  id: number;
  name: string;
  freight_charge: number;
  min_weight: number;
  etd: string; // Estimated time of delivery (e.g., "Jan 28, 2026")
  etd_hours: number; // Estimated delivery in hours
  estimated_delivery_days: number;
  cod: number; // 1 = COD available, 0 = not available
  rating: number;
  cod_charges: number;
  cod_multiplier: number;
  ship_type: number;
  delivery_performance: number;
  blocked: number;
  rto_performance: number;
  coverage_charges: number;
  base_weight: number;
  entry_tax: number;
  air_max_weight: number;
  surface_max_weight: number;
  call_before_delivery: string;
  mode: number;
  is_surface: boolean;
  is_rto_address_available: boolean;
  pickup_performance: number;
  city: string;
  state: string;
  postcode: string;
  region: number;
  suppress_date: string | null;
  suppress_text: string | null;
  qc_courier: number;
  rank: number;
  rto_charges: number;
  pod_available: string;
  is_hyperlocal: boolean;
  realtime_tracking: string;
  courier_type: number;
  cutoff_time: string;
  charge_weight: number;
}

interface ServiceabilityResponse {
  status: number;
  data: {
    available_courier_companies: CourierCompany[];
    child_courier_id: number | null;
    is_recommendation_enabled: number;
    recommendation_advance_rule: number;
    recommended_courier_company_id: number;
    recommended_by: {
      id: number;
      title: string;
    };
    shiprocket_recommended_courier_id: number;
    currency: string;
  };
}

interface DeliveryCheckResult {
  serviceable: boolean;
  estimatedDeliveryDate: string | null;
  estimatedDeliveryDays: number | null;
  message: string;
  courierName: string | null;
  shippingCost: number | null;
  codAvailable: boolean;
  allCouriers?: {
    name: string;
    estimatedDays: number;
    estimatedDate: string;
    cost: number;
    codAvailable: boolean;
    rating: number;
  }[];
}

/**
 * Authenticate with Shiprocket API and get a token
 * Token is valid for 10 days (240 hours)
 */
async function authenticate(): Promise<string> {
  // Check if we have a valid cached token
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  if (!shiprocketConfig.isConfigured()) {
    throw new Error(
      "Shiprocket API credentials not configured. Please set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD environment variables."
    );
  }

  try {
    const response = await axios.post<ShiprocketAuthResponse>(
      `${shiprocketConfig.baseUrl}/auth/login`,
      {
        email: shiprocketConfig.email,
        password: shiprocketConfig.password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const token = response.data.token;

    // Cache the token with expiry time (9 days to be safe)
    tokenCache.token = token;
    tokenCache.expiresAt = Date.now() + shiprocketConfig.tokenRefreshInterval;

    console.log("[Shiprocket] Successfully authenticated");
    return token;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      "[Shiprocket] Authentication failed:",
      axiosError.response?.data || axiosError.message
    );
    throw new Error("Failed to authenticate with Shiprocket API");
  }
}

/**
 * Check delivery serviceability for a pincode
 * Returns estimated delivery date, available couriers, and shipping costs
 */
export async function checkServiceability(
  deliveryPincode: string,
  options?: {
    pickupPincode?: string;
    weight?: number;
    cod?: boolean;
  }
): Promise<DeliveryCheckResult> {
  // Validate pincode format
  if (!/^\d{6}$/.test(deliveryPincode)) {
    return {
      serviceable: false,
      estimatedDeliveryDate: null,
      estimatedDeliveryDays: null,
      message: "Please enter a valid 6-digit PIN code",
      courierName: null,
      shippingCost: null,
      codAvailable: false,
    };
  }

  // Check if Shiprocket is configured
  if (!shiprocketConfig.isConfigured()) {
    console.warn(
      "[Shiprocket] API not configured, returning fallback response"
    );
    return getFallbackDeliveryEstimate(deliveryPincode);
  }

  try {
    const token = await authenticate();

    const pickupPincode =
      options?.pickupPincode || shiprocketConfig.defaultPickupPincode;
    const weight = options?.weight || shiprocketConfig.defaultWeight;
    const cod = options?.cod ? 1 : 0;

    const response = await axios.get<ServiceabilityResponse>(
      `${shiprocketConfig.baseUrl}/courier/serviceability/`,
      {
        params: {
          pickup_postcode: pickupPincode,
          delivery_postcode: deliveryPincode,
          cod: cod,
          weight: weight,
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { data } = response.data;

    if (
      !data.available_courier_companies ||
      data.available_courier_companies.length === 0
    ) {
      return {
        serviceable: false,
        estimatedDeliveryDate: null,
        estimatedDeliveryDays: null,
        message: `Delivery not available to PIN code ${deliveryPincode}. Please try a different address.`,
        courierName: null,
        shippingCost: null,
        codAvailable: false,
      };
    }

    // Get the recommended courier or the first available one
    const recommendedCourierId = data.shiprocket_recommended_courier_id;
    const recommendedCourier =
      data.available_courier_companies.find((c) => c.id === recommendedCourierId) ||
      data.available_courier_companies[0];

    // Parse the estimated delivery date
    const estimatedDate = recommendedCourier.etd;
    const estimatedDays = recommendedCourier.estimated_delivery_days;

    // Check if COD is available
    const codAvailable = recommendedCourier.cod === 1;

    // Get all available couriers for comparison
    const allCouriers = data.available_courier_companies
      .slice(0, 5) // Limit to top 5 couriers
      .map((courier) => ({
        name: courier.name,
        estimatedDays: courier.estimated_delivery_days,
        estimatedDate: courier.etd,
        cost: courier.freight_charge,
        codAvailable: courier.cod === 1,
        rating: courier.rating,
      }));

    return {
      serviceable: true,
      estimatedDeliveryDate: estimatedDate,
      estimatedDeliveryDays: estimatedDays,
      message: `Estimated delivery by ${estimatedDate}`,
      courierName: recommendedCourier.name,
      shippingCost: recommendedCourier.freight_charge,
      codAvailable: codAvailable,
      allCouriers: allCouriers,
    };
  } catch (error) {
    const axiosError = error as AxiosError;

    // Log error details
    console.error(
      "[Shiprocket] Serviceability check failed:",
      axiosError.response?.data || axiosError.message
    );

    // Check for specific error types
    if (axiosError.response?.status === 401) {
      // Token might be expired, clear cache and try once more
      tokenCache.token = null;
      tokenCache.expiresAt = 0;

      // Return fallback for now, next request will re-authenticate
      return getFallbackDeliveryEstimate(deliveryPincode);
    }

    if (axiosError.response?.status === 404) {
      return {
        serviceable: false,
        estimatedDeliveryDate: null,
        estimatedDeliveryDays: null,
        message: `Delivery not available to PIN code ${deliveryPincode}`,
        courierName: null,
        shippingCost: null,
        codAvailable: false,
      };
    }

    // For other errors, return fallback
    return getFallbackDeliveryEstimate(deliveryPincode);
  }
}

/**
 * Fallback delivery estimate when Shiprocket API is unavailable
 * Provides a reasonable estimate based on pincode patterns
 */
function getFallbackDeliveryEstimate(pincode: string): DeliveryCheckResult {
  // Simple estimation based on pincode region (first 2 digits indicate region)
  const region = parseInt(pincode.slice(0, 2), 10);

  // Rough estimation: metros (11-60) get faster delivery, remote areas take longer
  let estimatedDays: number;
  if (region >= 11 && region <= 60) {
    estimatedDays = 3 + Math.floor(Math.random() * 2); // 3-4 days for metros
  } else if (region >= 61 && region <= 80) {
    estimatedDays = 5 + Math.floor(Math.random() * 2); // 5-6 days for tier-2 cities
  } else {
    estimatedDays = 6 + Math.floor(Math.random() * 3); // 6-8 days for remote areas
  }

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + estimatedDays);

  const formattedDate = deliveryDate.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return {
    serviceable: true,
    estimatedDeliveryDate: formattedDate,
    estimatedDeliveryDays: estimatedDays,
    message: `Estimated delivery by ${formattedDate}`,
    courierName: null,
    shippingCost: null,
    codAvailable: true, // Assume COD is available in fallback
  };
}

/**
 * Clear the token cache (useful for testing or forced re-authentication)
 */
export function clearTokenCache(): void {
  tokenCache.token = null;
  tokenCache.expiresAt = 0;
}

/**
 * Check if Shiprocket service is properly configured
 */
export function isShiprocketConfigured(): boolean {
  return shiprocketConfig.isConfigured();
}

export const shiprocketService = {
  checkServiceability,
  clearTokenCache,
  isConfigured: isShiprocketConfigured,
};
