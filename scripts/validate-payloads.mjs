#!/usr/bin/env node
// Typechecks every payload in payloads/*.json against discord-api-types v10.
// Usage: node scripts/validate-payloads.mjs
// Requires: npm i typescript discord-api-types (any directory; run from repo root)

import { readdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import os from "node:os";

const root = path.resolve(import.meta.dirname, "..");
const payloadsDir = path.join(root, "payloads");
const require = createRequire(import.meta.url);

function resolveDep(name, subpath) {
  const req = createRequire(path.join(root, "scripts", "noop.js"));
  try {
    let p = req.resolve(name + (subpath ? "/" + subpath : ""));
    while (p && !existsSync(path.join(p, "package.json"))) p = path.dirname(p);
    return p;
  } catch {
    return null;
  }
}

const discordApiTypes = resolveDep("discord-api-types", "v10");
const typescript = resolveDep("typescript");

if (!discordApiTypes || !typescript) {
  console.error("Missing deps. Run: npm i typescript discord-api-types");
  process.exit(2);
}

const files = readdirSync(payloadsDir).filter((f) => f.endsWith(".json")).sort();
if (files.length === 0) {
  console.error("No payloads found in payloads/");
  process.exit(2);
}

const constName = (f) => f.replace(/\.json$/, "").replace(/-/g, "_").replace(/\./g, "_");
const msgs = files.filter((f) => !f.endsWith(".modal.json"));
const modals = files.filter((f) => f.endsWith(".modal.json"));

const out = [
  'import type {',
  '  APIMessageTopLevelComponent,',
  '  RESTPostAPIChannelMessageJSONBody,',
  '  APIModalInteractionResponse,',
  `} from ${JSON.stringify(path.join(discordApiTypes, "v10"))};`,
  '',
];

for (const f of msgs) {
  const json = readFileSync(path.join(payloadsDir, f), "utf8").trimEnd();
  out.push(`const ${constName(f)} = ${json} satisfies RESTPostAPIChannelMessageJSONBody & { components: APIMessageTopLevelComponent[] };`);
  out.push('');
}
for (const f of modals) {
  const json = readFileSync(path.join(payloadsDir, f), "utf8").trimEnd();
  out.push(`const ${constName(f)} = ${json} satisfies APIModalInteractionResponse;`);
  out.push('');
}

const work = mkdtempSync(path.join(os.tmpdir(), "dcv2-validate-"));
writeFileSync(path.join(work, "payloads.ts"), out.join("\n"));
writeFileSync(
  path.join(work, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: {
      strict: true,
      noEmit: true,
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      skipLibCheck: true,
    },
    include: ["."],
  }, null, 2),
);

const tsc = path.join(typescript, process.platform === "win32" ? "bin/tsc" : "bin/tsc");
try {
  execFileSync(process.execPath, [tsc, "-p", path.join(work, "tsconfig.json")], { stdio: "pipe" });
  console.log(`OK - ${msgs.length} message payloads + ${modals.length} modals typecheck clean`);
  process.exitCode = 0;
} catch (err) {
  console.error(String(err.stdout || err));
  console.error("Payload shape errors - fix the JSON in payloads/");
  process.exitCode = 1;
} finally {
  rmSync(work, { recursive: true, force: true });
}
