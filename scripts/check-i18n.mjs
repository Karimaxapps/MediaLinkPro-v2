#!/usr/bin/env node
/**
 * i18n key-parity check.
 *
 * Verifies every locale file in messages/ has exactly the same set of keys as
 * the default locale (en.json). Because non-English locales currently hold
 * English placeholders, the keys MUST stay in lockstep — a missing key throws
 * a runtime error in next-intl, and an extra key is dead weight.
 *
 * Exits non-zero (and prints the offending keys) when any locale drifts.
 * Run with: npm run i18n:check
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const MESSAGES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "messages");
const BASE_LOCALE = "en";

/** Flatten nested keys into dotted paths: { a: { b: 1 } } -> ["a.b"] */
function flattenKeys(obj, prefix = "") {
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

function load(locale) {
  return JSON.parse(readFileSync(join(MESSAGES_DIR, `${locale}.json`), "utf8"));
}

const localeFiles = readdirSync(MESSAGES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.replace(/\.json$/, ""));

const baseKeys = new Set(flattenKeys(load(BASE_LOCALE)));
let hasError = false;

for (const locale of localeFiles) {
  if (locale === BASE_LOCALE) continue;
  const keys = new Set(flattenKeys(load(locale)));

  const missing = [...baseKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !baseKeys.has(k));

  if (missing.length || extra.length) {
    hasError = true;
    console.error(`\n[X] ${locale}.json out of sync with ${BASE_LOCALE}.json`);
    if (missing.length) {
      console.error(`    Missing ${missing.length} key(s):`);
      missing.forEach((k) => console.error(`      - ${k}`));
    }
    if (extra.length) {
      console.error(`    Extra ${extra.length} key(s):`);
      extra.forEach((k) => console.error(`      + ${k}`));
    }
  } else {
    console.log(`[OK] ${locale}.json — ${keys.size} keys, in sync`);
  }
}

console.log(`\n${BASE_LOCALE}.json defines ${baseKeys.size} keys.`);

if (hasError) {
  console.error("\ni18n CHECK: FAILED — locale files have drifted.\n");
  process.exit(1);
}
console.log("i18n CHECK: PASSED — all locales in sync.\n");
