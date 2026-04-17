import { Router, Request, Response } from "express";
import { listZohoTaxes } from "../services/zohoInvoiceService.js";

const router = Router();

/**
 * GET /api/zoho-invoice/taxes
 * Returns list of taxes from Zoho Invoice (tax_id, name, percentage) for admin to pick by name.
 */
router.get("/taxes", async (_req: Request, res: Response) => {
  try {
    const taxes = await listZohoTaxes();
    res.json({ taxes });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch Zoho taxes" });
  }
});

export default router;
