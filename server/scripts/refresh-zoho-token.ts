/**
 * Temporary script: use Zoho refresh token to get a new access token.
 * Run from project root: npx tsx server/scripts/refresh-zoho-token.ts
 * Requires .env: ZOHO_INVOICE_CLIENT_ID, ZOHO_INVOICE_CLIENT_SECRET, ZOHO_INVOICE_REFRESH_TOKEN
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from project root (parent of server/)
const projectRoot = path.resolve(__dirname, "..", "..");
dotenv.config({ path: path.join(projectRoot, ".env") });

const accountsBase =
  process.env.ZOHO_INVOICE_ACCOUNTS_BASE_URL || "https://accounts.zoho.in";
const clientId = process.env.ZOHO_INVOICE_CLIENT_ID?.trim();
const clientSecret = process.env.ZOHO_INVOICE_CLIENT_SECRET?.trim();
const refreshToken = process.env.ZOHO_INVOICE_REFRESH_TOKEN?.trim();

async function main() {
  if (!clientId || !clientSecret || !refreshToken) {
    console.error("Missing env. Set ZOHO_INVOICE_CLIENT_ID, ZOHO_INVOICE_CLIENT_SECRET, ZOHO_INVOICE_REFRESH_TOKEN");
    process.exit(1);
  }

  const url = `${accountsBase}/oauth/v2/token`;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Zoho token error:", data);
    process.exit(1);
  }

  console.log("New access token (copy to ZOHO_INVOICE_ACCESS_TOKEN if needed):");
  console.log(data.access_token);
  console.log("\nExpires in (seconds):", data.expires_in ?? "—");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
