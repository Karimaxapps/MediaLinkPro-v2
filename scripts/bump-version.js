#!/usr/bin/env node
// Increments the build counter and syncs the year segment of the version.
// Version format stored in package.json: "{major}.{year}.{build}"
// Displayed in the app as: "v{major}.{year}.{build_zero_padded}"
// Run automatically as part of `npm run build`.

const fs = require("fs");
const path = require("path");

const pkgPath = path.join(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const parts = pkg.version.split(".");
const major = parts[0] ?? "1";
const build = parseInt(parts[2] ?? "0", 10);
const year = new Date().getFullYear();

pkg.version = `${major}.${year}.${build + 1}`;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log(`✓ App version bumped to ${pkg.version}`);
