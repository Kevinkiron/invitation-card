#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════
   Check public/music/ against lib/music/tracks.js.

       node scripts/check-music.mjs

   This does NOT download anything — see MUSIC-SETUP.md for why the
   music can't be fetched by script the way the demo photographs are.
   What this does instead:

     - confirms every track the app expects is present
     - confirms each one is actually an MP3, not a zero-byte file or an
       HTML login page saved under the wrong extension — by far the most
       common mistake when downloading these by hand
     - prints the exact page to (re-)download anything that's missing
       or looks wrong

   Safe to run any time, including in CI: it exits non-zero only when
   asked to with --strict, so a build does not have to fail over music
   that has not been set up yet.
   ══════════════════════════════════════════════════════════════════════ */

import { readFile, stat } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { MUSIC_TRACKS } from "../lib/music/tracks.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MUSIC_DIR = join(ROOT, "public", "music");
const strict = process.argv.includes("--strict");

/* A real MP3 starts with either an ID3 tag ("ID3") or a raw MPEG frame
   sync (0xFF Ex/Fx). An HTML page saved with a .mp3 extension — which is
   exactly what you get if a download link redirected to a login page —
   starts with "<!DOCTYPE" or "<html", and this catches that before it
   ships to a guest's phone as a "song" that is actually a web page. */
async function looksLikeMp3(path) {
  let fh;
  try {
    fh = await readFile(path);
  } catch {
    return { ok: false, reason: "missing" };
  }
  if (fh.length < 2048) return { ok: false, reason: `only ${fh.length} bytes — almost certainly not a real download` };
  const head = fh.subarray(0, 16).toString("latin1");
  if (head.startsWith("ID3")) return { ok: true };
  if (fh[0] === 0xff && (fh[1] & 0xe0) === 0xe0) return { ok: true };
  if (/^<!doctype|^<html/i.test(head)) return { ok: false, reason: "this is an HTML page, not an MP3 — the download link probably redirected to a login page" };
  return { ok: false, reason: "does not look like an MP3 (no ID3 tag or MPEG frame header)" };
}

async function main() {
  const all = Object.entries(MUSIC_TRACKS).flatMap(([kind, tracks]) =>
    tracks.map((t) => ({ kind, ...t }))
  );

  console.log(`Checking ${all.length} tracks in public/music/\n`);

  const results = [];
  for (const t of all) {
    const path = join(MUSIC_DIR, t.file);
    const check = await looksLikeMp3(path);
    results.push({ ...t, ...check });
    const mark = check.ok ? "✓" : "✗";
    console.log(`  ${mark} ${t.file.padEnd(22)} ${t.title} — ${t.artist}${check.ok ? "" : `  (${check.reason})`}`);
  }

  const bad = results.filter((r) => !r.ok);
  console.log(`\n${results.length - bad.length} of ${results.length} ready.`);

  if (bad.length) {
    console.log("\nStill needed:");
    for (const b of bad) console.log(`  ${b.file}  →  ${b.source}`);
    console.log("\nSee MUSIC-SETUP.md for the full walkthrough.");
    if (strict) process.exitCode = 1;
  } else {
    console.log("All set — every template has music for every track in its pool.");
  }
}

main().catch((e) => {
  console.error("Could not check the music folder:", e.message);
});
