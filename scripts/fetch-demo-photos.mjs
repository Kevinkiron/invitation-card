#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════
   Download the demo photographs into public/demo/.

       node scripts/fetch-demo-photos.mjs

   Run it once after cloning, and again whenever lib/demo/photos.js
   changes. It is safe to re-run: a file that is already there and is not
   empty is left alone unless you pass --force.

   The photographs are NOT committed to the repository. They are other
   people's work under the Unsplash licence, they are several megabytes
   each, and a repo is a poor place to keep binaries that can be fetched
   on demand. `public/demo/` is in .gitignore for that reason — which
   also means the build machine has to run this script, so it belongs in
   the build command:

       "build": "node scripts/fetch-demo-photos.mjs && next build"

   Without that, the demos deploy with broken images. The components draw
   a themed gradient when a picture fails to load, so the page degrades
   rather than breaking — but a gradient is not what the landing page is
   selling.
   ══════════════════════════════════════════════════════════════════════ */

import { mkdir, writeFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DEMO_PHOTOS, DEMO_PHOTO_DIR } from "../lib/demo/photos.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", DEMO_PHOTO_DIR);

const force = process.argv.includes("--force");
const WIDTH = 1600; // enough for a full-bleed phone scene at 3x

/* Unsplash's download endpoint redirects to the CDN with the right
   parameters applied. Using it rather than a hand-built images.unsplash
   URL means we are not guessing at their URL format, and it is the
   endpoint they ask integrations to use. */
const sourceUrl = (id) =>
  `https://unsplash.com/photos/${encodeURIComponent(id)}/download?force=true&w=${WIDTH}`;

async function already(path) {
  try {
    const s = await stat(path);
    return s.size > 1024; // a truncated download is not "already there"
  } catch {
    return false;
  }
}

async function fetchOne(p) {
  const dest = join(OUT, p.file);

  if (!force && (await already(dest))) return { ...p, skipped: true };

  /* One retry. These are large files over a redirect, and a single
     transient failure should not cost somebody the whole run. */
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

  console.log(`Fetching ${DEMO_PHOTOS.length} demo photographs into public/${DEMO_PHOTO_DIR}/\n`);

  const results = [];
  /* Four at a time. Unsplash is fine with this and it turns a two-minute
     serial run into about twenty seconds, but firing all thirty at once
     invites a rate limit and a half-populated folder. */
  const queue = [...DEMO_PHOTOS];
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

  /* Credit every photographer in one file, regenerated from the manifest
     so it cannot drift away from what was actually downloaded. */
  const notice = [
    "# Demo photographs",
    "",
    "The images in `public/demo/` are used only in the landing-page demo",
    "invitations. They are not part of the Welcvm product and no customer",
    "invitation uses them.",
    "",
    "All of them are published under the Unsplash licence, which permits",
    "commercial use without payment or attribution. Attribution is given",
    "here anyway. Nothing from Unsplash+ or Getty is included, and nothing",
    "from either may be added to `lib/demo/photos.js`.",
    "",
    "The Unsplash licence covers copyright. It is not a model release, and",
    "some of these photographs show identifiable people — replace them with",
    "photographs the business holds releases for before running paid",
    "advertising.",
    "",
    "| File | Photographer | Source |",
    "| --- | --- | --- |",
    ...DEMO_PHOTOS.map(
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
    console.log("\nRe-run to retry, or download those by hand into public/demo/.");
    /* Do not fail the build over this. A missing picture degrades to a
       gradient; a failed build takes the whole site down. */
  }
}

main().catch((e) => {
  console.error("Could not fetch the demo photographs:", e.message);
  console.error("The site will still build; the demos will show gradients.");
});
