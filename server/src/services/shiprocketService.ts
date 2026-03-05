// Shiprocket API Service
// Documentation: https://apidocs.shiprocket.in/

import axios, { AxiosError } from "axios";
import { shiprocketConfig } from "../config/shiprocket.js";
import Product from "../../../shared/models/Product.js";

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

/** Logout Shiprocket token on server shutdown: call logout API if we have a token, then clear cache */
export async function logoutTokenOnShutdown(): Promise<void> {
  const token = tokenCache.token;
  if (!token || !shiprocketConfig.isConfigured()) {
    clearTokenCache();
    return;
  }
  try {
    await axios.post(
      `${shiprocketConfig.baseUrl}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 3000,
      }
    );
    console.log("[Shiprocket] Token logged out on shutdown");
  } catch {
    // Logout endpoint may not exist or may fail; clear cache anyway
  } finally {
    clearTokenCache();
  }
}

/**
 * Check if Shiprocket service is properly configured
 */
export function isShiprocketConfigured(): boolean {
  return shiprocketConfig.isConfigured();
}

// Types for Shiprocket order creation
interface ShiprocketOrderItem {
  name: string;
  sku: string;
  units: number;
  selling_price: number;
  discount?: number;
  tax?: number;
  hsn?: string;
}

interface CreateOrderRequest {
  order_id: string;
  order_date: string;
  pickup_location: string;
  channel_id?: string;
  comment?: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2?: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name?: string;
  shipping_last_name?: string;
  shipping_address?: string;
  shipping_address_2?: string;
  shipping_city?: string;
  shipping_pincode?: string;
  shipping_state?: string;
  shipping_country?: string;
  shipping_email?: string;
  shipping_phone?: string;
  order_items: ShiprocketOrderItem[];
  payment_method: "COD" | "Prepaid";
  shipping_charges?: number;
  giftwrap_charges?: number;
  transaction_charges?: number;
  total_discount?: number;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

interface ShiprocketOrderResponse {
  order_id: number;
  shipment_id: number;
  status: string;
  status_code: number;
  onboarding_completed_now: number;
  awb_code: string;
  courier_company_id: number;
  courier_name: string;
}

export interface CreateShiprocketOrderResult {
  success: boolean;
  shiprocketOrderId: string;
  shiprocketShipmentId: string;
  awbCode: string | null;
  courierName: string | null;
  message: string;
}

/**
 * Create an order on Shiprocket for shipping
 * This is called when an order moves to PROCESSING status
 */
export async function createShiprocketOrder(order: any): Promise<CreateShiprocketOrderResult> {
  if (!shiprocketConfig.isConfigured()) {
    console.warn("[Shiprocket] API not configured, cannot create order");
    return {
      success: false,
      shiprocketOrderId: "",
      shiprocketShipmentId: "",
      awbCode: null,
      courierName: null,
      message: "Shiprocket API not configured. Please set SHIPROCKET_EMAIL and SHIPROCKET_PASSWORD environment variables.",
    };
  }

  try {
    const token = await authenticate();

    // Format order date
    const orderDate = new Date(order.orderDate);
    const formattedDate = orderDate.toISOString().split("T")[0]; // YYYY-MM-DD format

    // Fetch product SKUs (admin-set) for order items; fallback to productId if no sku
    const productIds = order.items
      .map((item: any) => item.productId)
      .filter(Boolean);
    const products =
      productIds.length > 0
        ? await Product.find({ _id: { $in: productIds } })
            .select("_id sku")
            .lean()
        : [];
    const productSkuMap = new Map<string, string>();
    for (const p of products as any[]) {
      const id = String(p._id);
      if (p.sku && String(p.sku).trim()) {
        productSkuMap.set(id, String(p.sku).trim().substring(0, 50));
      }
    }

    // Prepare order items - use product SKU from admin if set, else productId.
    // Shiprocket requires unique SKU per line; if same product appears multiple times, append suffix.
    const usedSkus = new Set<string>();
    const orderItems: ShiprocketOrderItem[] = order.items.map((item: any, index: number) => {
      const productIdStr = String(item.productId);
      let sku =
        productSkuMap.get(productIdStr) || productIdStr.substring(0, 50);
      // Ensure unique SKU per line (Shiprocket rejects "SKU cannot be repeated")
      if (usedSkus.has(sku)) {
        const maxSkuLen = 50;
        const suffix = `-${index + 1}`;
        sku = (sku.slice(0, maxSkuLen - suffix.length) + suffix).substring(0, maxSkuLen);
      }
      usedSkus.add(sku);
      return {
        name: item.name.substring(0, 100), // Shiprocket has 100 char limit
        sku,
        units: item.quantity || 1,
        selling_price: parseFloat(item.price) || 0,
      };
    });

    // Calculate total weight (default 0.5kg per item if not specified)
    const totalWeight = Math.max(0.5, order.items.length * 0.3);

    // Prepare request payload - pickup_location must exactly match a location name in Shiprocket dashboard
    const payload: CreateOrderRequest = {
      order_id: order.orderNumber,
      order_date: formattedDate,
      pickup_location: shiprocketConfig.pickupLocationName,
      billing_customer_name: order.shippingInfo.firstName || "Customer",
      billing_last_name: order.shippingInfo.lastName || "",
      billing_address: order.shippingInfo.address.substring(0, 200),
      billing_city: order.shippingInfo.city,
      billing_pincode: order.shippingInfo.pincode,
      billing_state: order.shippingInfo.state,
      billing_country: order.shippingInfo.country || "India",
      billing_email: order.shippingInfo.email,
      billing_phone: order.shippingInfo.phone.replace(/\D/g, "").slice(-10), // Last 10 digits
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
      sub_total: order.total,
      length: 20, // Default dimensions in cm
      breadth: 15,
      height: 10,
      weight: totalWeight,
    };

    console.log(`[Shiprocket] Creating order for ${order.orderNumber}:`, {
      items: orderItems.length,
      total: order.total,
      paymentMethod: payload.payment_method,
    });

    const response = await axios.post<ShiprocketOrderResponse & { message?: string; data?: any }>(
      `${shiprocketConfig.baseUrl}/orders/create/adhoc`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data as ShiprocketOrderResponse & { message?: string; data?: any; shipment?: { awb_code?: string; courier_name?: string } };

    // Shiprocket can return 200 with an error message in body (e.g. "Wrong Pickup location entered")
    if (data.message && (data.message.toLowerCase().includes("wrong") || data.message.toLowerCase().includes("error") || data.message.toLowerCase().includes("invalid"))) {
      console.error("[Shiprocket] API returned error in response body:", data.message, data.data);
      return {
        success: false,
        shiprocketOrderId: "",
        shiprocketShipmentId: "",
        awbCode: null,
        courierName: null,
        message: data.message + (data.data?.data ? " Check Shiprocket dashboard (Settings > Pickup Addresses) for valid pickup location names and set SHIPROCKET_PICKUP_LOCATION in .env to match exactly." : ""),
      };
    }
    if (!data.order_id || !data.shipment_id) {
      const errMsg = data.message || "Order creation did not return order_id/shipment_id";
      console.error("[Shiprocket] Invalid success response:", data);
      return {
        success: false,
        shiprocketOrderId: "",
        shiprocketShipmentId: "",
        awbCode: null,
        courierName: null,
        message: errMsg,
      };
    }

    // AWB may be at root or nested (e.g. data.awb_code or data.data?.awb_code) – capture as soon as shipment is booked
    const awbCode =
      (typeof data.awb_code === "string" && data.awb_code.trim()) ||
      (data.data && typeof data.data.awb_code === "string" && data.data.awb_code.trim()) ||
      (data.shipment && typeof data.shipment.awb_code === "string" && data.shipment.awb_code.trim())
        ? (data.awb_code || data.data?.awb_code || data.shipment?.awb_code || "").trim()
        : null;
    const courierNameRaw = data.courier_name ?? data.data?.courier_name ?? data.shipment?.courier_name;
    const courierName = typeof courierNameRaw === "string" && courierNameRaw.trim() ? courierNameRaw.trim() : null;

    console.log(`[Shiprocket] Order created successfully:`, { order_id: data.order_id, shipment_id: data.shipment_id, awbCode, courierName });

    return {
      success: true,
      shiprocketOrderId: String(data.order_id),
      shiprocketShipmentId: String(data.shipment_id),
      awbCode: awbCode || null,
      courierName: courierName || null,
      message: "Order created successfully on Shiprocket",
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      "[Shiprocket] Failed to create order:",
      axiosError.response?.data || axiosError.message
    );

    // Handle specific error cases
    const errorData = axiosError.response?.data as any;
    let errorMessage = "Failed to create order on Shiprocket";
    
    if (errorData?.message) {
      errorMessage = errorData.message;
    } else if (errorData?.errors) {
      errorMessage = Object.values(errorData.errors).flat().join(", ");
    }

    return {
      success: false,
      shiprocketOrderId: "",
      shiprocketShipmentId: "",
      awbCode: null,
      courierName: null,
      message: errorMessage,
    };
  }
}

/**
 * Get tracking details for a shipment by AWB code
 */
export async function getShipmentTracking(awbCode: string): Promise<any> {
  if (!shiprocketConfig.isConfigured()) {
    throw new Error("Shiprocket API not configured");
  }

  try {
    const token = await authenticate();

    const response = await axios.get(
      `${shiprocketConfig.baseUrl}/courier/track/awb/${awbCode}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      "[Shiprocket] Failed to get tracking:",
      axiosError.response?.data || axiosError.message
    );
    throw error;
  }
}

/**
 * Fetch order/shipment details from Shiprocket by order_id to get AWB when it was not set at create time
 */
export async function getOrderByShiprocketId(shiprocketOrderId: string): Promise<{ awb_code?: string } | null> {
  if (!shiprocketConfig.isConfigured()) {
    return null;
  }

  try {
    const token = await authenticate();
    const response = await axios.get(
      `${shiprocketConfig.baseUrl}/orders/show/${shiprocketOrderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;
    if (!data || typeof data !== "object") return null;
    // Shiprocket wraps payload in { data: { ... } }; unwrap so we read from the actual order payload
    const payload = (data as any).data && typeof (data as any).data === "object" ? (data as any).data : data;
    // Response may have awb at root (last_mile_awb, awb_data), order/shipments, or legacy paths
    const awbFromOrderShipments = (payload as any).order?.shipments?.[0]?.awb_code ?? null;
    const firstShipmentObj = (payload as any).shipment ?? (Array.isArray((payload as any).shipments) && (payload as any).shipments[0]) ?? (payload as any).order?.shipments?.[0];
    const awbFromFirstShipment = firstShipmentObj && typeof firstShipmentObj === "object"
      ? (firstShipmentObj.awb_code ?? firstShipmentObj.awb ?? null)
      : null;
    const awbData = (payload as any).awb_data;
    const awbFromAwbData = awbData && typeof awbData === "object"
      ? (awbData.awb_code ?? awbData.awb ?? (Array.isArray(awbData) && awbData[0] ? (awbData[0]?.awb_code ?? awbData[0]?.awb) : null))
      : typeof awbData === "string" && (awbData as string).trim()
        ? (awbData as string).trim()
        : null;
    const awb =
      (payload as any).last_mile_awb ??
      (payload as any).awb_code ??
      (payload as any).awb ??
      awbFromAwbData ??
      (payload as any).order?.awb_code ??
      (payload as any).shipment?.awb_code ??
      (payload as any).shipment?.awb ??
      (Array.isArray((payload as any).shipments) && (payload as any).shipments[0]?.awb_code)
        ? (payload as any).shipments[0].awb_code
        : awbFromOrderShipments ?? awbFromFirstShipment;
    if (typeof awb === "string" && awb.trim()) {
      return { awb_code: awb.trim() };
    }
    return null;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.warn(
      "[Shiprocket] Could not fetch order by id:",
      axiosError.response?.data || axiosError.message
    );
    return null;
  }
}

/**
 * Fetch shipment by shipment_id (GET /v1/external/shipments/{id}).
 * Returns AWB from response.data.awb - use this when order has shiprocketShipmentId.
 */
export async function getShipmentByShipmentId(shipmentId: string): Promise<{ awb_code: string } | null> {
  if (!shiprocketConfig.isConfigured()) {
    return null;
  }
  try {
    const token = await authenticate();
    const response = await axios.get(
      `${shiprocketConfig.baseUrl}/shipments/${shipmentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = response.data;
    if (!data || typeof data !== "object") return null;
    const payload = (data as any).data && typeof (data as any).data === "object" ? (data as any).data : data;
    const awb = (payload as any).awb;
    if (typeof awb === "string" && awb.trim()) {
      return { awb_code: awb.trim() };
    }
    return null;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.warn(
      "[Shiprocket] Could not fetch shipment by id:",
      axiosError.response?.data || axiosError.message
    );
    return null;
  }
}

/**
 * Cancel a Shiprocket order
 */
export async function cancelShiprocketOrder(shiprocketOrderId: string): Promise<boolean> {
  if (!shiprocketConfig.isConfigured()) {
    throw new Error("Shiprocket API not configured");
  }

  try {
    const token = await authenticate();

    await axios.post(
      `${shiprocketConfig.baseUrl}/orders/cancel`,
      { ids: [parseInt(shiprocketOrderId)] },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`[Shiprocket] Order ${shiprocketOrderId} cancelled`);
    return true;
  } catch (error) {
    const axiosError = error as AxiosError;
    console.error(
      "[Shiprocket] Failed to cancel order:",
      axiosError.response?.data || axiosError.message
    );
    return false;
  }
}

export const shiprocketService = {
  checkServiceability,
  clearTokenCache,
  logoutTokenOnShutdown,
  isConfigured: isShiprocketConfigured,
  createOrder: createShiprocketOrder,
  getTracking: getShipmentTracking,
  getOrderByShiprocketId,
  getShipmentByShipmentId,
  cancelOrder: cancelShiprocketOrder,
};
