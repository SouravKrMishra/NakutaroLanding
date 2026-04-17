// Zoho OAuth token service for Zoho Invoice (India - accounts.zoho.in)
// Uses refresh token flow and in-memory caching to minimize token endpoint calls.
// Docs: https://www.zoho.com/accounts/protocol/oauth/web-apps/access-token-expiry.html

import axios, { AxiosError } from "axios";

interface ZohoTokenCache {
  accessToken: string | null;
  expiresAt: number; // epoch ms
  refreshPromise: Promise<string> | null;
}

const tokenCache: ZohoTokenCache = {
  accessToken: null,
  expiresAt: 0,
  refreshPromise: null,
};

function getAccountsBaseUrl(): string {
  // India data center by default
  return process.env.ZOHO_INVOICE_ACCOUNTS_BASE_URL || "https://accounts.zoho.in";
}

function getStaticEnvToken(): string | null {
  const t = process.env.ZOHO_INVOICE_ACCESS_TOKEN?.trim();
  return t && t.length > 0 ? t : null;
}

async function refreshAccessToken(): Promise<string> {
  const clientId = process.env.ZOHO_INVOICE_CLIENT_ID?.trim();
  const clientSecret = process.env.ZOHO_INVOICE_CLIENT_SECRET?.trim();
  const refreshToken = process.env.ZOHO_INVOICE_REFRESH_TOKEN?.trim();

  // If refresh-flow config is missing, fall back to static env token if present.
  if (!clientId || !clientSecret || !refreshToken) {
    const staticToken = getStaticEnvToken();
    if (staticToken) {
      return staticToken;
    }
    throw new Error(
      "Zoho Invoice OAuth is not fully configured. Please set ZOHO_INVOICE_CLIENT_ID, ZOHO_INVOICE_CLIENT_SECRET, ZOHO_INVOICE_REFRESH_TOKEN or provide ZOHO_INVOICE_ACCESS_TOKEN."
    );
  }

  const url = `${getAccountsBaseUrl()}/oauth/v2/token`;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  try {
    const response = await axios.post<{
      access_token: string;
      expires_in: number;
    }>(url, body.toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = response.data.access_token;
    let expiresInSec = Number(response.data.expires_in) || 3600; // Zoho default 1h

    // Refresh slightly before actual expiry (1 minute early) to be safe
    if (expiresInSec > 120) {
      expiresInSec -= 60;
    }

    tokenCache.accessToken = accessToken;
    tokenCache.expiresAt = Date.now() + expiresInSec * 1000;

    return accessToken;
  } catch (err) {
    const ax = err as AxiosError<any>;
    console.error(
      "[Zoho Invoice] Failed to refresh access token:",
      ax.response?.data || ax.message
    );

    // As a safety net, if a static token is configured, fall back to it
    const staticToken = getStaticEnvToken();
    if (staticToken) {
      return staticToken;
    }

    throw new Error("Zoho Invoice: Unable to refresh access token");
  }
}

/**
 * Get a valid Zoho Invoice access token.
 * - Uses in-memory cache (one refresh per expiry window).
 * - Coalesces concurrent refreshes into a single request.
 */
export async function getZohoInvoiceAccessToken(): Promise<string> {
  // Use cached token if still valid
  if (tokenCache.accessToken && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  // If a refresh is already in progress, reuse that promise
  if (tokenCache.refreshPromise) {
    return tokenCache.refreshPromise;
  }

  const refreshPromise = refreshAccessToken()
    .then((token) => {
      tokenCache.accessToken = token;
      if (!tokenCache.expiresAt) {
        // If expiresAt wasn't set for some reason, give it a conservative 50 minutes window
        tokenCache.expiresAt = Date.now() + 50 * 60 * 1000;
      }
      return token;
    })
    .finally(() => {
      tokenCache.refreshPromise = null;
    });

  tokenCache.refreshPromise = refreshPromise;
  return refreshPromise;
}

/** For tests / diagnostics */
export function clearZohoInvoiceTokenCache(): void {
  tokenCache.accessToken = null;
  tokenCache.expiresAt = 0;
  tokenCache.refreshPromise = null;
}

