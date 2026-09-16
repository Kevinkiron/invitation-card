# Welcvm — this batch

Copy every file in this folder over the matching path in
`D:\New folder\invitation-card`. All paths here mirror the repo exactly.

## Before it will run

**1. Fetch the demo photographs** (unchanged from last time, if you
already did this you're done):

```
node scripts/fetch-demo-photos.mjs
```

**2. Get the background music.** This one's manual — see
`MUSIC-SETUP.md` for the full walkthrough. Short version: twelve tracks
from Pixabay Music, free and unrestricted for commercial use, but
Pixabay gates the actual download behind a free account so there's no
one-command script for this the way there is for photos. It's twelve
clicks into `public/music/`, then:

```
node scripts/check-music.mjs
```

tells you exactly what's still missing and where to get it. Skipping
this is safe — invitations open and work identically with no music at
all, they just won't have any until the files are there.

**3. Add to `.gitignore`:**

```
public/demo/
public/music/
```

**4. Wire the photo fetch into the build**, so Vercel fetches those on
every deploy:

```json
"build": "node scripts/fetch-demo-photos.mjs && next build"
```

The twelve music files are small enough to commit once you've downloaded
them (a few MB total) — do that rather than trying to fetch them on
every deploy, since there's no script that can.

## What is in this batch

**Background music, on all four templates** — `lib/music/tracks.js`
(the track library — 3 curated tracks per occasion), `lib/music/useCinemaMusic.js`
(the playback hook), `components/MusicToggle.js`, `app/music.css`. Wired
into `WeddingCinema.js` and `CelebrationCinema.js`.

Music starts on the same "Tap to open" click that already opens every
invitation — that's not a stylistic choice, it's the only gesture on the
page a browser will actually accept as permission to play audio with
sound. Every invitation gets a track picked automatically from a
3-track pool per occasion, and the pick is *stable*: the same invitation
always plays the same track (worked out from the couple's or host's
names and date), it just varies invitation to invitation. A small toggle
bottom-right lets a guest mute it, tinted to that invitation's own
palette.

**A real nav bug, fixed** — a verification pass found `.w-nav-links` had
no wrap fallback: if the real logo and the six event links didn't quite
fit the available width, the links would spill and draw directly over
the logo and the CTA button instead of wrapping. Fixed in
`app/landing.css`. Worth a look on your actual deployed header once,
since this was tested against a stand-in logo, not your real Wordmark
artwork.

**Everything from the previous batch** is still in here if you're
applying both together: the photo-placement fix, the three premium
templates, the demo pages, and the landing page rework.

## Verified, not just asserted

A standalone harness actually ran `next build` plus Playwright
screenshots this time — the landing page and all four demo templates, at
360px, mobile (390px) and desktop (1440px), plus targeted stress tests
on the nav fix and the music toggle's position. Screenshots are attached
separately. Two honest caveats from that pass:

- The harness doesn't have your real fonts (Google Fonts is blocked from
  this sandbox) or your real logo artwork, so typography and the exact
  nav width in the screenshots are approximations, not final.
- The demo photographs in the screenshots are flat placeholder
  gradients — real ones need `fetch-demo-photos.mjs` run on your
  machine, same as last time.

## Still to do

- The chat interview still doesn't build the three new templates —
  picking "birthday" in `/create` still gets the generic design. Same
  gap as last time, and still the next real piece of work.
- Once you've downloaded the real music files, it's worth a quick
  listen-through on an actual phone to confirm volume and looping feel
  right — that can't be judged from a screenshot.
