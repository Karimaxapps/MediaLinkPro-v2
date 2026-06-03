// One-off: create the new Verified Pro prices ($4.99/mo, $49.90/yr) on the
// same Stripe product as the existing Individual Pro price, then print the
// new price IDs so they can be pasted into .env.local.
//
// Run:  node scripts/create-stripe-prices.mjs
import fs from "node:fs";
import path from "node:path";
import Stripe from "stripe";

function readEnv(file) {
  const out = {};
  const txt = fs.readFileSync(file, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const env = readEnv(path.resolve(process.cwd(), ".env.local"));
const key = env.STRIPE_SECRET_KEY;
if (!key) throw new Error("STRIPE_SECRET_KEY not found in .env.local");
if (!key.startsWith("sk_test_")) {
  throw new Error(`Refusing to run: key is not a test key (got ${key.slice(0, 8)}…). Aborting.`);
}

const stripe = new Stripe(key);

const oldMonthlyId = env.NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL_PRO_MONTHLY;
if (!oldMonthlyId) throw new Error("Existing INDIVIDUAL_PRO_MONTHLY price id not found");

const oldMonthly = await stripe.prices.retrieve(oldMonthlyId);
const productId = oldMonthly.product;
console.log(`Reusing product ${productId} (from old price ${oldMonthlyId})`);

const monthly = await stripe.prices.create({
  product: productId,
  currency: "usd",
  unit_amount: 499,
  recurring: { interval: "month" },
  nickname: "Verified Pro — Monthly (launch offer)",
  metadata: { plan_id: "individual_pro", billing_interval: "month" },
});

const annual = await stripe.prices.create({
  product: productId,
  currency: "usd",
  unit_amount: 4990,
  recurring: { interval: "year" },
  nickname: "Verified Pro — Annual (2 months free)",
  metadata: { plan_id: "individual_pro", billing_interval: "year" },
});

console.log("\n=== NEW PRICE IDS ===");
console.log(`NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL_PRO_MONTHLY=${monthly.id}`);
console.log(`NEXT_PUBLIC_STRIPE_PRICE_INDIVIDUAL_PRO_ANNUAL=${annual.id}`);
console.log("=====================\n");
console.log(JSON.stringify({ monthly: monthly.id, annual: annual.id }));
