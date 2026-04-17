// Zoho Invoice API Service (India domain - zohoapis.in)
// Creates contacts and invoices when orders are successfully paid.
// Docs: https://www.zoho.com/invoice/api/v3/introduction/

import axios, { AxiosError } from "axios";
import mongoose from "mongoose";
import { zohoInvoiceConfig } from "../config/zohoInvoice.js";
import { getZohoInvoiceAccessToken } from "./zohoTokenService.js";
import { Order } from "../../../shared/models/Order.js";
import { User } from "../../../shared/models/User.js";
import TaxSlab from "../../../shared/models/TaxSlab.js";
import Product from "../../../shared/models/Product.js";

const BASE = () => zohoInvoiceConfig.baseUrl;

type ShippingInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
};

async function getAuthHeaders(opts?: { orgInQueryOnly?: boolean }): Promise<Record<string, string>> {
  const token = await getZohoInvoiceAccessToken();
  const orgId = zohoInvoiceConfig.organizationId;
  if (!token || !orgId) {
    throw new Error(
      "Zoho Invoice: OAuth token and ZOHO_INVOICE_ORGANIZATION_ID must be set"
    );
  }
  const headers: Record<string, string> = {
    Authorization: `Zoho-oauthtoken ${token}`,
    "Content-Type": "application/json",
  };
  if (!opts?.orgInQueryOnly) {
    headers.organization_id = orgId;
  }
  return headers;
}

/**
 * Send POST with JSON body (recommended pattern for Zoho Invoice API v3).
 */
async function postJson(endpoint: string, payload: object): Promise<any> {
  const url = `${BASE()}/${endpoint}`;
  const headers = await getAuthHeaders();
  const res = await axios.post(url, payload, {
    headers,
  });
  return res.data;
}

/**
 * Send GET request with optional query params.
 * For listZohoTaxes, use orgInQueryOnly so organization_id is only in query (avoids "Invalid URL Passed" code 5).
 */
async function get(
  endpoint: string,
  params?: Record<string, string>,
  orgInQueryOnly?: boolean
): Promise<any> {
  const base = BASE().replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${base}${path}`;
  const headers = await getAuthHeaders({ orgInQueryOnly });
  const res = await axios.get(url, {
    headers,
    params,
  });
  return res.data;
}

/**
 * List taxes from Zoho Invoice (for admin to pick tax_id by name).
 * Returns { taxes: Array<{ tax_id, name, percentage }> }.
 * Zoho India sometimes returns "Invalid URL Passed" (code 5) for GET /taxes; then use manual tax ID in Admin > Tax.
 */
export async function listZohoTaxes(): Promise<
  Array<{ tax_id: string; name: string; percentage?: number }>
> {
  if (!zohoInvoiceConfig.isConfigured()) {
    return [];
  }
  const orgId = zohoInvoiceConfig.organizationId;
  if (!orgId) return [];
  const base = BASE().replace(/\/$/, "");
  const token = await getZohoInvoiceAccessToken();
  const buildHeaders = (omitOrgHeader: boolean) => {
    const h: Record<string, string> = {
      Authorization: `Zoho-oauthtoken ${token}`,
    };
    if (!omitOrgHeader) h.organization_id = orgId;
    return h;
  };
  const parseTaxList = (data: any) => {
    const raw = data?.taxes ?? data?.tax ?? [];
    const list = Array.isArray(raw) ? raw : [];
    return list.map((t: any) => ({
      tax_id: String(t.tax_id ?? ""),
      name: String(t.name ?? t.tax_name ?? "—"),
      percentage: t.percentage ?? t.tax_percentage ?? t.rate,
    }));
  };

  const attempts: Array<{ url: string; params?: Record<string, string>; noOrgHeader?: boolean }> = [
    // Primary (matches your working Postman call)
    { url: `${base}/settings/taxes`, params: undefined },
    { url: `${base}/settings/taxes`, params: { organization_id: orgId }, noOrgHeader: true },
    { url: `${base}/settings/taxes/`, params: undefined },
    // Fallbacks kept for compatibility with any older/variant endpoints
    { url: `${base}/taxes`, params: { organization_id: orgId }, noOrgHeader: true },
    { url: `${base}/taxes`, params: undefined },
    { url: `${base}/taxes/`, params: { organization_id: orgId } },
    { url: `${base}/tax`, params: { organization_id: orgId }, noOrgHeader: true },
    { url: `${base}/organizations/${orgId}/taxes` },
  ];
  for (const { url, params, noOrgHeader } of attempts) {
    try {
      const res = await axios.get(url, {
        headers: buildHeaders(!!noOrgHeader),
        params,
        validateStatus: () => true,
      });
      const data = res.data;
      if (res.status === 200 && !data?.code) {
        const list = parseTaxList(data);
        if (list.length > 0) return list;
      }
    } catch (_) {
      continue;
    }
  }
  console.warn(
    "[Zoho Invoice] List taxes not available (code 5). Use Admin > Tax and enter Zoho Tax ID manually from Zoho Invoice Settings > Taxes."
  );
  return [];
}

/**
 * Find or create a contact in Zoho Invoice. Returns contact_id.
 */
export async function findOrCreateContact(
  shippingInfo: ShippingInfo,
  opts?: { userId?: string }
): Promise<string> {
  const contactName =
    [shippingInfo.firstName, shippingInfo.lastName].filter(Boolean).join(" ") ||
    "Customer";
  const email = String(shippingInfo.email || "").trim().toLowerCase();
  const phone = String(shippingInfo.phone || "").replace(/[^\d+]/g, "");

  // Load user once if we have userId (for gst_treatment, company, and cached zohoContactId)
  let userDoc: any | null = null;
  if (opts?.userId) {
    try {
      userDoc = await User.findById(opts.userId).lean();
      if (userDoc?.zohoContactId) {
        return String(userDoc.zohoContactId);
      }
    } catch (e) {
      console.warn(
        "[Zoho Invoice] Failed to load user for Zoho contact linking:",
        (e as any)?.message
      );
    }
  }

  // 1) Try to find an existing contact by email/phone BEFORE creating a new one.
  // Paginate through contacts (first few pages) and match in-memory.
  try {
    let page = 1;
    while (page <= 5) {
      const list = await get("contacts", { page: String(page) });
      const contacts = list?.contacts ?? list?.contact ?? [];
      if (Array.isArray(contacts) && contacts.length > 0) {
        const existing = contacts.find((c: any) => {
          const cEmail = String(c.email || "").trim().toLowerCase();
          const cPhone = String(c.phone || "").replace(/[^\d+]/g, "");
          const emailMatch = email && cEmail && cEmail === email;
          const phoneMatch = phone && cPhone && cPhone === phone;
          return emailMatch || phoneMatch;
        });
        if (existing?.contact_id) {
          const idStr = String(existing.contact_id);
          if (userDoc && !userDoc.zohoContactId && opts?.userId) {
            try {
              await User.updateOne(
                { _id: opts.userId },
                { $set: { zohoContactId: idStr } }
              );
            } catch (e) {
              console.warn(
                "[Zoho Invoice] Failed to cache zohoContactId on user:",
                (e as any)?.message
              );
            }
          }
          return idStr;
        }
      }
      const ctx = list?.page_context;
      if (!ctx || ctx.has_more_page === false) break;
      page += 1;
    }
  } catch (e) {
    console.warn(
      "[Zoho Invoice] contacts search failed, will fall back to create:",
      (e as any)?.message
    );
  }

  // Decide contact name and GST treatment based on user account type (business vs individual)
  let gst_treatment: string = "consumer";
  let companyNameForContact: string | undefined;
  let customerSubType: string = "individual";
  if (opts?.userId) {
    const user = userDoc;
    if (user) {
      const userType = (user as any).userType;
      if (userType === "business") {
        gst_treatment = "business_unregistered";
        companyNameForContact = (user as any).companyName || contactName;
        customerSubType = "business";
      }
    }
  }

  const createPayload = {
    contact_name: companyNameForContact || contactName,
    company_name: companyNameForContact,
    customer_sub_type: customerSubType,
    email: shippingInfo.email,
    phone: shippingInfo.phone,
    gst_treatment,
    billing_address: {
      address: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zip: shippingInfo.pincode,
      country: shippingInfo.country,
    },
    // If Zoho shipping address is left blank, mirror billing so customer has both filled.
    shipping_address: {
      address: shippingInfo.address,
      city: shippingInfo.city,
      state: shippingInfo.state,
      zip: shippingInfo.pincode,
      country: shippingInfo.country,
    },
  };

  try {
    const data = await postJson("contacts", createPayload);
    const id = data?.contact?.contact_id ?? data?.contact_id;
    if (id) {
      const idStr = String(id);
      if (userDoc && opts?.userId) {
        try {
          await User.updateOne(
            { _id: opts.userId },
            { $set: { zohoContactId: idStr } }
          );
        } catch (e) {
          console.warn(
            "[Zoho Invoice] Failed to cache zohoContactId on user after create:",
            (e as any)?.message
          );
        }
      }
      return idStr;
    }
    throw new Error("Zoho Invoice: create contact response missing contact_id");
  } catch (err: any) {
    const ax = err as AxiosError<{ code?: number; message?: string }>;
    const responseData = ax.response?.data as any;
    const code = responseData?.code;
    const message = String(responseData?.message ?? ax.message ?? "");

    // If contact with same email exists, list contacts and find by email
    if (code === 6000 || message.toLowerCase().includes("already exists") || message.toLowerCase().includes("duplicate")) {
      const list = await get("contacts");
      const contacts = list?.contacts ?? list?.contact ?? [];
      const byEmail = Array.isArray(contacts) ? contacts.find((c: any) => (c.email || "").toLowerCase() === shippingInfo.email.toLowerCase()) : null;
      if (byEmail?.contact_id) {
        const idStr = String(byEmail.contact_id);
        if (userDoc && opts?.userId) {
          try {
            await User.updateOne(
              { _id: opts.userId },
              { $set: { zohoContactId: idStr } }
            );
          } catch (e) {
            console.warn(
              "[Zoho Invoice] Failed to cache zohoContactId on user after duplicate-detected search:",
              (e as any)?.message
            );
          }
        }
        return idStr;
      }
    }
    throw err;
  }
}

const SELLER_STATE = (process.env.STORE_STATE || "Delhi").toLowerCase();

/**
 * Map Indian state/UT names (as stored in order.shippingInfo.state) to Zoho Invoice
 * place_of_supply 2-letter codes. Used so Zoho applies IGST vs CGST/SGST correctly.
 * @see https://www.zoho.com/invoice/api/v3/invoices/ — place_of_supply (India only)
 */
const STATE_TO_PLACE_OF_SUPPLY: Record<string, string> = {
  "andhra pradesh": "AP",
  "arunachal pradesh": "AR",
  assam: "AS",
  bihar: "BR",
  chhattisgarh: "CG",
  delhi: "DL",
  "nct of delhi": "DL",
  "delhi ncr": "DL",
  goa: "GA",
  gujarat: "GJ",
  haryana: "HR",
  "himachal pradesh": "HP",
  jharkhand: "JH",
  karnataka: "KA",
  kerala: "KL",
  "madhya pradesh": "MP",
  maharashtra: "MH",
  manipur: "MN",
  meghalaya: "ML",
  mizoram: "MZ",
  nagaland: "NL",
  odisha: "OR",
  punjab: "PB",
  rajasthan: "RJ",
  sikkim: "SK",
  "tamil nadu": "TN",
  telangana: "TS",
  tripura: "TR",
  "uttar pradesh": "UP",
  uttarakhand: "UK",
  "west bengal": "WB",
  "andaman and nicobar islands": "AN",
  chandigarh: "CH",
  "dadra and nagar haveli and daman and diu": "DD",
  "jammu and kashmir": "JK",
  ladakh: "LA",
  lakshadweep: "LD",
  puducherry: "PY",
};

function getPlaceOfSupplyCode(stateName: string): string {
  if (!stateName || typeof stateName !== "string") return "DL";
  const key = stateName.trim().toLowerCase();
  return STATE_TO_PLACE_OF_SUPPLY[key] ?? "DL";
}

/** Zoho Invoice customerpayments `payment_mode` (lowercase). */
function zohoPaymentModeFromOrder(paymentMethod: string | undefined): string {
  const m = String(paymentMethod || "").toUpperCase();
  if (m === "RAZORPAY") return "razorpay";
  if (m === "CARD") return "creditcard";
  if (m === "COD") return "cash";
  if (m === "PHONEPE" || m === "CONTROPAY") return "others";
  return "banktransfer";
}

const defaultTaxId = (): string | number | undefined => {
  const raw = zohoInvoiceConfig.taxId;
  // Keep as string to avoid precision loss on large Zoho IDs.
  return raw || undefined;
};

const defaultIgstTaxId = (): string | number | undefined => {
  const raw = process.env.ZOHO_INVOICE_IGST_TAX_ID?.trim() || "";
  // Keep as string to avoid precision loss on large Zoho IDs.
  return raw || undefined;
};

/**
 * Resolve Zoho tax_id for an order line item.
 * Intra‑state: product GST override > category GST slab > env default GST.
 * Inter‑state: product IGST override > category IGST slab > env default IGST (fallback to GST env).
 */
async function resolveTaxIdForItem(
  productId: any,
  category: string,
  isIntraState: boolean,
  productGstOverrideMap: Map<string, string>,
  productIgstOverrideMap: Map<string, string>,
  categoryGstSlabMap: Map<string, string>,
  categoryIgstSlabMap: Map<string, string>
): Promise<string | number | undefined> {
  const pid = productId?.toString?.();
  const catKey = String(category || "").toLowerCase();

  if (isIntraState) {
    if (pid && productGstOverrideMap.has(pid)) {
      return productGstOverrideMap.get(pid)!;
    }
    if (catKey && categoryGstSlabMap.has(catKey)) {
      return categoryGstSlabMap.get(catKey)!;
    }
    // No default GST fallback; if nothing matches, leave tax unset for this line.
    return undefined;
  }

  // Inter‑state (IGST)
  if (pid && productIgstOverrideMap.has(pid)) {
    return productIgstOverrideMap.get(pid)!;
  }
  if (catKey && categoryIgstSlabMap.has(catKey)) {
    return categoryIgstSlabMap.get(catKey)!;
  }
  // No default IGST/GST fallback; if nothing matches, leave tax unset for this line.
  return undefined;
}

/**
 * Create an invoice in Zoho Invoice for the given order.
 * Uses order.shippingInfo for contact and order.items for line items.
 * Tax per line: product zohoTaxIdOverride > category tax slab > ZOHO_INVOICE_TAX_ID.
 * Returns invoice_id (string) or null if integration is disabled/fails.
 */
export async function createInvoiceForOrder(order: any): Promise<string | null> {
  if (!zohoInvoiceConfig.isConfigured()) {
    return null;
  }
  if (order.zohoInvoiceId) {
    return order.zohoInvoiceId;
  }

  const shippingInfo: ShippingInfo = order.shippingInfo;
  if (!shippingInfo?.email) {
    console.warn("[Zoho Invoice] Order missing shippingInfo.email, skipping invoice");
    return null;
  }

  let contactId: string;
  try {
    contactId = await findOrCreateContact(shippingInfo, {
      userId: order.userId?.toString?.(),
    });
  } catch (err: any) {
    console.error("[Zoho Invoice] Failed to find/create contact:", err?.response?.data ?? err.message);
    return null;
  }

  const items = order.items ?? [];
  const productIds = items
    .map((i: any) => i.productId?.toString?.())
    .filter((id: string) => id && mongoose.Types.ObjectId.isValid(id));
  const products = productIds.length
    ? await Product.find({ _id: { $in: productIds } })
        .select("_id zohoTaxIdOverride zohoIgstTaxIdOverride zohoHsnOverride")
        .lean()
    : [];
  const productGstOverrideMap = new Map<string, string>();
  const productIgstOverrideMap = new Map<string, string>();
  const productHsnOverrideMap = new Map<string, string>();
  for (const p of products as any[]) {
    if (p.zohoTaxIdOverride) {
      productGstOverrideMap.set(p._id.toString(), p.zohoTaxIdOverride);
    }
    if (p.zohoIgstTaxIdOverride) {
      productIgstOverrideMap.set(
        p._id.toString(),
        String(p.zohoIgstTaxIdOverride).trim()
      );
    }
    if (p.zohoHsnOverride) {
      productHsnOverrideMap.set(p._id.toString(), String(p.zohoHsnOverride).trim());
    }
  }
  const slabs = await TaxSlab.find().lean();
  const categoryGstSlabMap = new Map<string, string>();
  const categoryIgstSlabMap = new Map<string, string>();
  const categoryHsnMap = new Map<string, string>();
  for (const s of slabs as any[]) {
    const key = String(s.category || "").toLowerCase();
    if (!key) continue;
    if (s.zohoTaxId) {
      categoryGstSlabMap.set(key, String(s.zohoTaxId));
    }
    if (s.igstZohoTaxId) {
      categoryIgstSlabMap.set(key, String(s.igstZohoTaxId));
    }
    if (s.hsnCode && String(s.hsnCode).trim()) {
      categoryHsnMap.set(s.category, String(s.hsnCode).trim());
    }
  }

  const customerState = String(shippingInfo.state || "").toLowerCase();
  const isIntraState = customerState === SELLER_STATE;

  const shippingTaxRaw = zohoInvoiceConfig.shippingTaxId;
  const igstShippingRaw = process.env.ZOHO_INVOICE_IGST_SHIPPING_TAX_ID?.trim() || "";
  const shippingTaxId = isIntraState
    ? (shippingTaxRaw || undefined)
    : (igstShippingRaw || shippingTaxRaw || undefined);
  const defaultHsn = zohoInvoiceConfig.defaultHsnCode;
  const shippingSac = zohoInvoiceConfig.shippingSacCode;

  const resolveHsnForItem = (productId: string | undefined, category: string | undefined): string => {
    const id = productId?.toString?.();
    if (id && productHsnOverrideMap.has(id)) return productHsnOverrideMap.get(id)!;
    if (category && categoryHsnMap.has(category)) return categoryHsnMap.get(category)!;
    return defaultHsn;
  };

  // Official API: https://www.zoho.com/invoice/api/v3/invoices/ — line_items use product_type ("goods"/"services") and hsn_or_sac (India). Do NOT send "type".
  type LineItem = {
    name: string;
    quantity: number;
    rate: number;
    description?: string;
    tax_id?: string;
    product_type?: string;
    hsn_or_sac?: string;
  };

  const toTaxIdStr = (v: string | number | undefined): string | undefined =>
    v === undefined ? undefined : String(v);

  const lineItems: LineItem[] = [];

  for (const item of items) {
    let taxId = await resolveTaxIdForItem(
      item.productId,
      item.category,
      isIntraState,
      productGstOverrideMap,
      productIgstOverrideMap,
      categoryGstSlabMap,
      categoryIgstSlabMap
    );
    const hsn = resolveHsnForItem(item.productId?.toString?.(), item.category);
    const line: LineItem = {
      name: item.name || "Product",
      quantity: Math.max(1, Number(item.quantity) || 1),
      rate: Number(item.price) || 0,
      description: item.category || undefined,
      product_type: "goods",
      hsn_or_sac: hsn,
    };
    if (taxId !== undefined) line.tax_id = toTaxIdStr(taxId);
    lineItems.push(line);
  }

  const shippingCost = Number(order.shippingCost) || 0;
  if (shippingCost > 0) {
    const shipTaxId = shippingTaxId ? String(shippingTaxId).trim() : undefined;
    const line: LineItem = {
      name: "Shipping",
      quantity: 1,
      rate: shippingCost,
      product_type: "service",
      hsn_or_sac: shippingSac,
    };
    if (shipTaxId) line.tax_id = shipTaxId;
    lineItems.push(line);
  }

  const couponDiscount = Number(order.couponDiscount) || 0;
  if (couponDiscount > 0) {
    const line: LineItem = {
      name: "Discount",
      quantity: 1,
      rate: -couponDiscount,
      product_type: "goods",
      hsn_or_sac: defaultHsn,
    };
    // Do not apply any additional tax to the discount line itself.
    lineItems.push(line);
  }

  // Zoho error 15: "billing_address" must be < 100 chars; they count the whole JSON e.g. {"address":"..."} so 15 + len(address) < 100 => max 84.
  const ship = order.shippingInfo || {};
  const fullLine = [ship.address, ship.city, ship.state, ship.pincode, ship.country]
    .filter(Boolean)
    .map((x) => String(x).trim())
    .join(", ")
    .trim() || String(ship.address || "").trim();
  const addressOnly = fullLine.slice(0, 84);
  const billingAddress =
    addressOnly
      ? { address: addressOnly, zip: ship.pincode }
      : undefined;
  const shippingAddress = billingAddress
    ? { address: billingAddress.address, zip: ship.pincode }
    : undefined;

  // India: place_of_supply drives whether Zoho applies IGST (other state) or CGST/SGST (same state as org).
  const placeOfSupply = getPlaceOfSupplyCode(shippingInfo.state);

  const buildPayload = (items: LineItem[]) => {
    const payload: Record<string, any> = {
      customer_id: contactId,
      date: new Date().toISOString().slice(0, 10),
      reference_number: order.orderNumber || order._id?.toString?.(),
      line_items: items,
      notes: `Order ${order.orderNumber || order._id}. Payment: ${order.paymentMethod || "N/A"}.`,
      is_inclusive_tax: true,
      place_of_supply: placeOfSupply,
    };
    if (billingAddress?.address) {
      payload.billing_address = billingAddress;
      payload.shipping_address = shippingAddress ?? billingAddress;
    }
    return payload;
  };

  const totalAmount = Number(order.total) || 0;

  const paymentMode = zohoPaymentModeFromOrder(order.paymentMethod);
  const recordPaymentForInvoice = async (
    invId: string,
    customerId?: string
  ): Promise<void> => {
    if (totalAmount <= 0) return;
    const paymentDate = new Date().toISOString().slice(0, 10);
    const cid = customerId ?? contactId;
    try {
      await postJson("customerpayments", {
        customer_id: cid,
        payment_mode: paymentMode,
        amount: totalAmount,
        date: paymentDate,
        invoices: [{ invoice_id: invId, amount_applied: totalAmount }],
      });
      console.log(`[Zoho Invoice] Recorded payment for invoice ${invId}, amount ${totalAmount}`);
    } catch (payErr: any) {
      console.error("[Zoho Invoice] Record payment failed:", payErr?.response?.data ?? payErr.message);
    }
  };

  const markInvoiceAsSent = async (invId: string): Promise<void> => {
    try {
      await postJson(`invoices/${invId}/status/sent`, {});
      console.log(`[Zoho Invoice] Marked invoice ${invId} as sent`);
    } catch (err: any) {
      console.warn("[Zoho Invoice] Mark as sent failed (invoice may stay draft):", err?.response?.data?.message ?? err.message);
    }
  };

  const itemsWithoutTax = lineItems.map(({ tax_id, ...rest }) => rest);

  const createInvoiceWithContact = async (
    cid: string,
    items: LineItem[] = lineItems
  ): Promise<string> => {
    const payload = buildPayload(items);
    payload.customer_id = cid;
    const data = await postJson("invoices", payload);
    const invoiceId = data?.invoice?.invoice_id ?? data?.invoice_id;
    if (invoiceId) {
      const idStr = String(invoiceId);
      await markInvoiceAsSent(idStr);
      await recordPaymentForInvoice(idStr, cid);
      return idStr;
    }
    throw new Error("Zoho Invoice: create invoice response missing invoice_id");
  };

  const tryCreateWithOptionalNoTax = async (cid: string): Promise<string | null> => {
    try {
      return await createInvoiceWithContact(cid, itemsWithoutTax);
    } catch (noTaxErr: any) {
      console.error(
        "[Zoho Invoice] Retry without tax failed:",
        noTaxErr?.response?.data ?? noTaxErr.message
      );
      return null;
    }
  };

  try {
    return await createInvoiceWithContact(contactId);
  } catch (err: any) {
    const code = err?.response?.data?.code;
    // Customer not accessible (deleted or wrong org). Clear cached contact and retry with a fresh lookup/create.
    if (code === 1002 && order.userId) {
      try {
        await User.updateOne(
          { _id: order.userId },
          { $unset: { zohoContactId: 1 } }
        );
        const newContactId = await findOrCreateContact(shippingInfo, {
          userId: order.userId?.toString?.(),
        });
        try {
          const invoiceId = await createInvoiceWithContact(newContactId);
          console.log(
            "[Zoho Invoice] Invoice created after retry (cleared invalid cached contact)"
          );
          return invoiceId;
        } catch (retryErr: any) {
          const retryCode = retryErr?.response?.data?.code;
          if (retryCode === 1016) {
            console.warn(
              "[Zoho Invoice] Taxes deleted (1016) on retry. Retrying without tax_id on line items (Zoho may still apply default taxes). Update tax IDs in Admin > Tax."
            );
            const id = await tryCreateWithOptionalNoTax(newContactId);
            if (id) return id;
          }
          console.error(
            "[Zoho Invoice] Retry after 1002 failed:",
            retryErr?.response?.data ?? retryErr.message
          );
        }
      } catch (clearErr: any) {
        console.error(
          "[Zoho Invoice] Clear contact / find-or-create failed:",
          clearErr?.message
        );
      }
    }
    // Some taxes have been deleted in Zoho (1016). Retry without tax_id on line items.
    if (code === 1016) {
      console.warn(
        "[Zoho Invoice] Taxes deleted (1016). Retrying without tax_id on line items (Zoho may still apply default taxes). Set valid Zoho Tax IDs in Admin > Tax."
      );
      const id = await tryCreateWithOptionalNoTax(contactId);
      if (id) return id;
    }
    console.error("[Zoho Invoice] Failed to create invoice:", err?.response?.data ?? err.message);
    return null;
  }
}

/**
 * Create Zoho invoice for order when payment is successful. Saves zohoInvoiceId on order if created.
 * Call this after setting order status to ORDER_SUCCESS and paymentStatus to COMPLETED.
 * Does not throw; logs errors and returns.
 */
export async function createZohoInvoiceForOrderIfNeeded(order: any): Promise<void> {
  if (!order || !zohoInvoiceConfig.isConfigured()) return;
  if (order.zohoInvoiceId) return;

  try {
    const invoiceId = await createInvoiceForOrder(order);
    if (invoiceId) {
      await Order.updateOne(
        { _id: order._id },
        { $set: { zohoInvoiceId: invoiceId } }
      );
      console.log(`[Zoho Invoice] Created invoice ${invoiceId} for order ${order.orderNumber}`);
    }
  } catch (err: any) {
    console.error(`[Zoho Invoice] Error creating invoice for order ${order.orderNumber}:`, err.message);
  }
}
