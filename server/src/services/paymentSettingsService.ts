import { Settings } from "../../../shared/models/Settings.js";
import { hasContropayCredentials } from "../config/contropay.js";
import { hasRazorpayCredentials } from "../config/razorpay.js";

// Cache the settings to avoid frequent database queries
let phonepeEnabledCache: boolean | null = null;
let codEnabledCache: boolean | null = null;
let contropayEnabledCache: boolean | null = null;
let phonepeCacheTimestamp: number = 0;
let codCacheTimestamp: number = 0;
let contropayCacheTimestamp: number = 0;
const CACHE_DURATION = 10000; // 10 seconds cache (reduced for faster updates)

/**
 * Check if PhonePe payment gateway is enabled
 * Uses caching to reduce database queries
 */
export const isPhonepeEnabled = async (): Promise<boolean> => {
  const now = Date.now();

  // Return cached value if still valid
  if (
    phonepeEnabledCache !== null &&
    now - phonepeCacheTimestamp < CACHE_DURATION
  ) {
    return phonepeEnabledCache;
  }

  try {
    const setting = await Settings.findOne({ key: "phonepe_enabled" });
    const isEnabled = setting ? setting.value : false;

    // Update cache
    phonepeEnabledCache = isEnabled;
    phonepeCacheTimestamp = now;

    return isEnabled;
  } catch (error) {
    console.error("Error checking PhonePe enabled status:", error);
    // Default to false on error
    return false;
  }
};

/**
 * Clear the cache (useful when settings are updated)
 */
export const clearPhonepeCache = () => {
  phonepeEnabledCache = null;
  phonepeCacheTimestamp = 0;
};

/**
 * Check if Cash on Delivery (COD) is enabled
 * Uses caching to reduce database queries
 */
export const isCODEnabled = async (): Promise<boolean> => {
  const now = Date.now();

  // Return cached value if still valid
  if (codEnabledCache !== null && now - codCacheTimestamp < CACHE_DURATION) {
    return codEnabledCache;
  }

  try {
    const setting = await Settings.findOne({ key: "cod_enabled" });
    const isEnabled = setting ? setting.value : true; // Default to true if not set

    // Update cache
    codEnabledCache = isEnabled;
    codCacheTimestamp = now;

    return isEnabled;
  } catch (error) {
    console.error("Error checking COD enabled status:", error);
    // Default to true on error (COD enabled by default)
    return true;
  }
};

/**
 * Clear the COD cache (useful when settings are updated)
 */
export const clearCODCache = () => {
  codEnabledCache = null;
  codCacheTimestamp = 0;
};

/**
 * Check if Contropay payment gateway is enabled
 * Uses caching to reduce database queries
 * Also checks if credentials are configured
 */
export const isContropayEnabled = async (): Promise<boolean> => {
  // If no credentials, always return false
  if (!hasContropayCredentials) {
    return false;
  }

  const now = Date.now();

  // Return cached value if still valid
  if (
    contropayEnabledCache !== null &&
    now - contropayCacheTimestamp < CACHE_DURATION
  ) {
    return contropayEnabledCache;
  }

  try {
    const setting = await Settings.findOne({ key: "contropay_enabled" });
    const isEnabled = setting ? setting.value : false;

    // Update cache
    contropayEnabledCache = isEnabled;
    contropayCacheTimestamp = now;

    return isEnabled;
  } catch (error) {
    console.error("Error checking Contropay enabled status:", error);
    // Default to false on error
    return false;
  }
};

/**
 * Clear the Contropay cache (useful when settings are updated)
 */
export const clearContropayCache = () => {
  contropayEnabledCache = null;
  contropayCacheTimestamp = 0;
};

// Razorpay cache
let razorpayEnabledCache: boolean | null = null;
let razorpayCacheTimestamp: number = 0;

/**
 * Check if Razorpay payment gateway is enabled
 * Uses caching to reduce database queries
 * Also checks if credentials are configured
 */
export const isRazorpayEnabled = async (): Promise<boolean> => {
  if (!hasRazorpayCredentials) {
    return false;
  }

  const now = Date.now();

  if (
    razorpayEnabledCache !== null &&
    now - razorpayCacheTimestamp < CACHE_DURATION
  ) {
    return razorpayEnabledCache;
  }

  try {
    const setting = await Settings.findOne({ key: "razorpay_enabled" });
    const isEnabled = setting ? setting.value : false;

    razorpayEnabledCache = isEnabled;
    razorpayCacheTimestamp = now;

    return isEnabled;
  } catch (error) {
    console.error("Error checking Razorpay enabled status:", error);
    return false;
  }
};

/**
 * Clear the Razorpay cache (useful when settings are updated)
 */
export const clearRazorpayCache = () => {
  razorpayEnabledCache = null;
  razorpayCacheTimestamp = 0;
};
