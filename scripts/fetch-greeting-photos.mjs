#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════
   Download the greeting-occasion photographs into public/greetings/.

       node scripts/fetch-greeting-photos.mjs

   The counterpart to scripts/fetch-demo-photos.mjs, for the fourteen
   photos in lib/greetings/photos.js instead of the homepage's demo
   pictures. Same reasoning applies: these are other people's work under
   the Unsplash licence, several megabytes each, and not something a repo
   should hold as binaries — so public/greetings/ is gitignored (see
   .gitignore) and the build machine fetches them itself, which is why
   this is wired into the build command below rather than run by hand.

       "build": "node scripts/fetch-demo-photos.mjs && node scripts/fetch-greeting-photos.mjs && next build"

   Without that, the /greetings landing cards deploy with broken images.
   OccasionCardArt (components/greetings/OccasionCardArt.js) falls back to
   that occasion's own colour gradient when a photo fails to load, so the
   page degrades rather than breaking — but a gradient is exactly what
   this feature replaces, so it is worth re-running this if it happens.

   Safe to re-run: a file that is already there and not empty is left
   alone unless you pass --force.
   ══════════════════════════════════════════════════════════════════════ */

import { mkdir, writeFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GREETING_PHOTOS, GREETING_PHOTO_DIR } from "../lib/greetings/photos.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", GREETING_PHOTO_DIR);

const force = process.argv.includes("--force");
const WIDTH = 1200; // landing-grid tiles, not full-bleed — smaller than the demo phone photos

const sourceUrl = (id) =>
  `https://unsplash.com/photos/${encodeURIComponent(id)}/download?force=true&w=${WIDTH}`;

async function already(path) {
  try {
    const s = await stat(path);
    return s.size > 1024;
  } catch {
    return false;
  }
}

async function fetchOne(p) {
  const dest = join(OUT, p.file);

  if (!force && (await already(dest))) return { ...p, skipped: true };

  let lastErr;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(sourceUrl(p.id), { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 1024) throw new Error(`suspiciously small (${buf.length} bytes)`);
      await writeFile(dest, buf);
      return { ...p, bytes: buf.length };
    } catch (e) {
      lastErr = e;
    }
  }
  return { ...p, error: lastErr?.message || "failed" };
}

async function main() {
  await mkdir(OUT, { recursive: true });

  console.log(`Fetching ${GREETING_PHOTOS.length} greeting photographs into public/${GREETING_PHOTO_DIR}/\n`);

  const results = [];
  const queue = [...GREETING_PHOTOS];
  const workers = Array.from({ length: 4 }, async () => {
    for (let p = queue.shift(); p; p = queue.shift()) {
      const r = await fetchOne(p);
      results.push(r);
      const mark = r.error ? "✗" : r.skipped ? "·" : "✓";
      const note = r.error ? ` — ${r.error}` : r.skipped ? " (already there)" : ` ${(r.bytes / 1024 / 1024).toFixed(1)} MB`;
      console.log(`  ${mark} ${r.file}${note}`);
    }
  });
  await Promise.all(workers);

  const notice = [
    "# Greeting occasion photographs",
    "",
    "The images in `public/greetings/` are the background photos on the",
    "/greetings landing grid (one per occasion). They are not part of any",
    "customer's card — a sender's own card never shows one of these.",
    "",
    "All of them are published under the Unsplash licence, which permits",
    "commercial use without payment or attribution. Attribution is given",
    "here anyway. Nothing from Unsplash+ or Getty is included, and nothing",
    "from either may be added to `lib/greetings/photos.js`.",
    "",
    "The Unsplash licence covers copyright. It is not a model release, and",
    "a few of these photographs show identifiable people.",
    "",
    "| File | Photographer | Source |",
    "| --- | --- | --- |",
    ...GREETING_PHOTOS.map(
      (p) => `| \`${p.file}\` | ${p.credit} | https://unsplash.com/photos/${p.id} |`
    ),
    "",
  ].join("\n");
  await writeFile(join(OUT, "NOTICE.md"), notice);

  const failed = results.filter((r) => r.error);
  const got = results.filter((r) => !r.error && !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;

  console.log(`\n${got} downloaded, ${skipped} already present, ${failed.length} failed.`);

  if (failed.length) {
    console.log("\nFailed:");
    for (const f of failed) console.log(`  ${f.file}  ${sourceUrl(f.id)}`);
    console.log("\nRe-run to retry, or download those by hand into public/greetings/.");
  }
}

main().catch((e) => {
  console.error("Could not fetch the greeting photographs:", e.message);
  console.error("The site will still build; the /greetings cards will show their colour gradients.");
});
