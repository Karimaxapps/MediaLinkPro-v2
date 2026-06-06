// Bulk-import event exhibitor participation from the dataset.
// UPDATES EXISTING ORGANIZATIONS ONLY — never creates new orgs.
// Source data: scripts/exhibitor-data.json (extracted from the xlsx).
//
// Usage: node scripts/import-exhibitors.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// ── Load env from .env.local (no dotenv dependency) ──
const env = {};
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Missing SUPABASE_URL / SERVICE_ROLE_KEY in .env.local");

const supabase = createClient(url, key, { auth: { persistSession: false } });

// ── Name normalization (applied to both sides) ──
const LEGAL = new Set([
  "inc","llc","ltd","limited","gmbh","co","corp","corporation","company","kk",
  "srl","sa","ag","bv","oy","pty","plc","spa","sas","sl","as","ab","aps","kg",
  "kabushiki","kaisha","group","holdings","technologies","technology","systems",
]);
function normalize(s) {
  return String(s)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w && !LEGAL.has(w))
    .join(" ");
}

async function main() {
  const data = JSON.parse(readFileSync("scripts/exhibitor-data.json", "utf8"));

  // Event slug → id
  const { data: events, error: evErr } = await supabase
    .from("events")
    .select("id, slug")
    .in("slug", ["nab-show-2026", "ibc-show-2026", "inter-bee-2025"]);
  if (evErr) throw evErr;
  const eventIdBySlug = Object.fromEntries(events.map((e) => [e.slug, e.id]));
  console.log("Events:", eventIdBySlug);

  // All organizations (paginated)
  const orgs = [];
  for (let from = 0; ; from += 1000) {
    const { data: page, error } = await supabase
      .from("organizations")
      .select("id, name, slug")
      .range(from, from + 999);
    if (error) throw error;
    orgs.push(...page);
    if (page.length < 1000) break;
  }
  console.log("Organizations in DB:", orgs.length);

  const orgByNorm = new Map();
  for (const o of orgs) {
    orgByNorm.set(normalize(o.name), o);
    orgByNorm.set(normalize(o.slug), o); // also try slug-normalized
  }

  // Match dataset → existing orgs; collect exhibitor rows
  const rows = new Map(); // key event_id|org_id
  const matchedOrgIds = new Set();
  const unmatched = [];
  for (const entry of data) {
    const org = orgByNorm.get(normalize(entry.name));
    if (!org) {
      unmatched.push(entry.name);
      continue;
    }
    matchedOrgIds.add(org.id);
    for (const slug of entry.events) {
      const eventId = eventIdBySlug[slug];
      if (!eventId) continue;
      rows.set(`${eventId}|${org.id}`, {
        event_id: eventId,
        organization_id: org.id,
        source: "import",
      });
    }
  }

  const inserts = [...rows.values()];
  console.log(`Matched orgs: ${matchedOrgIds.size} | exhibitor rows to upsert: ${inserts.length}`);
  console.log(`Unmatched dataset companies: ${unmatched.length}`);

  // Upsert in batches (idempotent on unique constraint)
  let written = 0;
  for (let i = 0; i < inserts.length; i += 500) {
    const batch = inserts.slice(i, i + 500);
    const { error } = await supabase
      .from("event_exhibitors")
      .upsert(batch, { onConflict: "event_id,organization_id", ignoreDuplicates: true });
    if (error) throw error;
    written += batch.length;
  }
  console.log(`Upserted ${written} exhibitor rows.`);
  console.log("Sample unmatched (first 15):", unmatched.slice(0, 15));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
