import { NextResponse } from "next/server";

/* ══════════════════════════════════════════════════════════════════════
   Block Vercel's image optimizer endpoint outright.

   next.config.mjs already sets `images.unoptimized: true`, which stops
   THIS APP from ever generating a `/_next/image?...` URL — but that flag
   does not close the endpoint itself. `/_next/image` exists on every
   Vercel deployment automatically, regardless of whether the app uses
   it, and it will still accept a request built by hand (or by a bot)
   with an arbitrary width/quality and try to process it, which is what
   ran the account's free Image Optimization allowance over its limit
   (see the note in next.config.mjs — this app has no next/image
   `<Image>` usage anywhere, every photo is a plain `<img>`, so every
   optimizer request was always someone else's, not this app's own
   traffic).

   Refusing the request here, before Next.js's own image-optimization
   handler ever runs, is what actually stops it from being billed as a
   transformation or a cache write — `unoptimized: true` alone did not,
   which is why the same usage panel kept climbing after that change
   shipped. */
export function middleware() {
  return new NextResponse("Image optimization is not available on this site.", {
    status: 404,
    headers: { "content-type": "text/plain" },
  });
}

export const config = {
  matcher: "/_next/image",
};
