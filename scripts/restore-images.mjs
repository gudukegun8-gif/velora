// Restores brand images from base64 chunks into public/images/.
// Runs on `postinstall` so Vercel (and any fresh clone) gets the images
// without storing multi-MB binaries in git.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const b64dir = join(root, "images.b64");
const outdir = join(root, "public", "images");

const manifestPath = join(b64dir, "manifest.json");
if (!existsSync(manifestPath)) {
  console.log("[velora] no image manifest found, skipping restore");
  process.exit(0);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
mkdirSync(outdir, { recursive: true });

let restored = 0;
for (const [name, parts] of Object.entries(manifest)) {
  const out = join(outdir, name);
  if (existsSync(out)) continue; // already present (e.g. local dev)
  let b64 = "";
  for (let i = 0; i < parts; i++) {
    b64 += readFileSync(join(b64dir, `${name}.part${i}`), "utf8");
  }
  writeFileSync(out, Buffer.from(b64, "base64"));
  restored++;
}
console.log(`[velora] images restored: ${restored} written (${Object.keys(manifest).length} total)`);
