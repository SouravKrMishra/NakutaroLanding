import { Settings } from "../../../shared/models/Settings.js";

// Cache the settings to avoid frequent database queries
let phonepeEnabledCache: boolean | null = null;
let codEnabledCache: boolean | null = null;
let phonepeCacheTimestamp: number = 0;
let codCacheTimestamp: number = 0;
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
