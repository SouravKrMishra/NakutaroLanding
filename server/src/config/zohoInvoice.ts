// Zoho Invoice API Configuration (India domain - .in)
// Documentation: https://www.zoho.com/invoice/api/v3/introduction/
// For India, use base URL: https://www.zohoapis.in/invoice/v3

const ZOHO_INVOICE_BASE_IN = "https://www.zohoapis.in/invoice/v3";

export const zohoInvoiceConfig = {
  /** API base URL for Zoho Invoice (India) */
  get baseUrl(): string {
    return process.env.ZOHO_INVOICE_BASE_URL || ZOHO_INVOICE_BASE_IN;
  },

  /** Optional static OAuth 2.0 access token (used as fallback if refresh flow is not configured). */
  get accessToken(): string {
    return process.env.ZOHO_INVOICE_ACCESS_TOKEN || "";
  },

  /** Organization ID from Zoho Invoice (Manage Organizations in admin console or GET /organizations). */
  get organizationId(): string {
    return process.env.ZOHO_INVOICE_ORGANIZATION_ID || "";
  },

  /**
   * Optional tax ID to apply to invoice line items.
   * If your org default tax (e.g. GST12) is expired (error 1016), create a tax in Zoho Invoice
   * (e.g. 0% "No Tax") with valid effective dates and set this to that tax's ID.
   */
  get taxId(): string {
    return process.env.ZOHO_INVOICE_TAX_ID?.trim() || "";
  },

  /** Tax ID for Shipping line only (e.g. 18% GST). Override so shipping uses 18% not default 5%. */
  get shippingTaxId(): string {
    return process.env.ZOHO_INVOICE_SHIPPING_TAX_ID?.trim() || "";
  },

  /** Default HSN code for product line items (Goods). e.g. 6109 for T-shirts, 6110 for sweaters. */
  get defaultHsnCode(): string {
    return process.env.ZOHO_INVOICE_DEFAULT_HSN?.trim() || "6109";
  },

  /** SAC code for Shipping (service). e.g. 998599 for transport support services. */
  get shippingSacCode(): string {
    return process.env.ZOHO_INVOICE_SHIPPING_SAC?.trim() || "998599";
  },

  isConfigured(): boolean {
    const hasStaticToken = !!this.accessToken;
    const hasRefreshFlow =
      !!process.env.ZOHO_INVOICE_CLIENT_ID &&
      !!process.env.ZOHO_INVOICE_CLIENT_SECRET &&
      !!process.env.ZOHO_INVOICE_REFRESH_TOKEN;

    return Boolean(this.organizationId && (hasStaticToken || hasRefreshFlow));
  },
};

