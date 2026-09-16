/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  /* Vercel's Image Optimization (Cache Writes / Transformations / Cache
     Reads on the Usage dashboard) exceeded its free allowance this month
     — 111K/100K cache writes. A search through the app for every place
     an image is rendered (all the templates, WeddingCinema,
     CelebrationCinema, the dashboard, manage, admin and create pages,
     the demo previews) turned up no use of next/image's `<Image>`
     component anywhere — every photo in this app is a plain `<img>`, so
     nothing here was ever supposed to be going through that pipeline.

     The optimizer endpoint (`/_next/image`) exists automatically on
     every Vercel deployment regardless of whether the app uses it, and
     it accepts a width and a quality as plain query parameters — a
     scanner or bot hitting it directly with many different width/quality
     values against the same image is a known, cheap way to run up
     someone else's optimization bill with almost no cost to itself. The
     numbers here point that way: 111K cache WRITES against only 54K
     cache READS is backwards from real traffic, where a cached image
     gets reused far more than it gets created fresh.

     Since nothing in this codebase relies on Vercel optimizing images,
     turning the feature off entirely costs nothing functionally and
     stops any further usage in this category outright, whatever the
     actual cause turns out to be. If a real need for it shows up later
     (a next/image-based gallery, say), remove this and configure
     `images.remotePatterns`/`localPatterns` deliberately instead of
     leaving the endpoint wide open. */
  images: {
    unoptimized: true,
  },
};
export default nextConfig;
