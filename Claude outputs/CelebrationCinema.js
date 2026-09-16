"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Calendar, ChevronDown, MapPin } from "lucide-react";
import {
  celebrationKind,
  emptyCelebrationTokens,
} from "@/lib/design/celebration-tokens";
import { themeFor } from "@/components/celebration/themes";
import "@/app/celebration.css";

/* ══════════════════════════════════════════════════════════════════════
   CELEBRATION CINEMA — the premium template for a birthday, a naming
   ceremony and a griha pravesh.

   One engine. Everything that differs between the three comes out of
   components/celebration/themes.js: the palette, the ornaments, which
   scenes exist and in what order, the headings, the voice and the way
   the date is revealed. Nothing in this file knows what a birthday is.

   Props:
     tokens  – a celebration token object (lib/design/celebration-tokens)
     preview – true when inside the PhoneFrame on the create page or the
               dashboard: compact type, no opening overlay, nothing the
               host has to interact with to see their own invitation.

   Every scene is gated on its own data. A scene with nothing to say does
   not render an empty shell — half a dozen headings over blank space is
   what a template looks like when it is pretending to be finished.
   ══════════════════════════════════════════════════════════════════════ */

/* ── Helpers ──────────────────────────────────────────────────────────── */

/* A map link is pasted by the couple and rendered into an href, so it is
   checked rather than trusted: https only, and only the hosts Google
   actually uses. Anything else falls through to the search query. */
function safeMapHref(raw) {
  const v = String(raw || "").trim();
  if (!v) return "";
  try {
    const u = new URL(v);
    if (u.protocol !== "https:") return "";
    const ok = [
      "maps.google.com", "www.google.com", "google.com",
      "maps.app.goo.gl", "goo.gl", "g.co",
    ];
    const host = u.hostname.toLowerCase();
    if (ok.includes(host) || host.endsWith(".google.com")) return u.toString();
    return "";
  } catch {
    return "";
  }
}

/* A heading may be a string or a function of the invitation's own data
   ("Meet Aarav"). Resolving it here means the themes can be declarative
   and still say the child's name out loud. */
const txt = (v, ctx) => (typeof v === "function" ? v(ctx) : v || "");

/* "6 February 2027" → its parts, for the big date lockup. A date the
   host typed in some other shape is not forced: it goes through whole as
   the month line rather than being mangled into a wrong day number. */
function parseDate(displayDate) {
  if (!displayDate) return { day: "", month: "", year: "" };
  const parts = String(displayDate).match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (parts) return { day: parts[1], month: parts[2], year: parts[3] };
  return { day: "", month: displayDate, year: "" };
}

/* The groups every scene reads through. A stored config saved mid-
   interview can carry only some of them, and a plain `{...empty, ...raw}`
   would then leave `venue` as whatever `raw` had — usually undefined —
   so the first `venue.name` read throws and the guest gets a blank page
   instead of an invitation. Merging group by group means a missing group
   falls back to the empty one and every read below is safe. */
const GROUPS = ["host", "invitation", "venue", "social", "rsvp", "palette", "media"];

function hydrate(raw, kind) {
  const base = emptyCelebrationTokens(kind);
  const out = { ...base, ...(raw || {}) };
  for (const g of GROUPS) out[g] = { ...base[g], ...(raw?.[g] || {}) };
  /* Same argument for the two arrays: a config that stored `events: null`
     would otherwise reach `events.map` and take the page down. */
  out.events = Array.isArray(raw?.events) ? raw.events : [];
  out.story = Array.isArray(raw?.story) ? raw.story : [];
  return out;
}

/* Media is the one part of the token object a third party writes — the
   photo uploader — so every array read is defended rather than trusted.
   A half-finished upload that left `storyImages` as a string is enough to
   turn `.map` into a crash on the guest's phone. */
const list = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);

/* ── IntersectionObserver hook for scroll reveals ── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ── Word-by-word reveal ──
   The space goes BETWEEN the spans, not inside them. `.cc-word` is an
   inline-block, and an inline-block drops its own trailing whitespace —
   with the space inside, every heading on the page renders as
   "Howthedayunfolds". A bare text node between the boxes is a real space
   and still gives the line somewhere to break. */
function WordReveal({ text, visible, delay = 0 }) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  return words.map((word, i) => (
    <Fragment key={i}>
      <span
        className={`cc-word ${visible ? "cc-revealed" : ""}`}
        style={{ transitionDelay: `${delay + i * 70}ms` }}
      >
        {word}
      </span>
      {i < words.length - 1 ? " " : null}
    </Fragment>
  ));
}

function SceneHeading({ eyebrow, title, intro }) {
  const [ref, vis] = useReveal();
  return (
    <header ref={ref} className="cc-scene-heading">
      {eyebrow && <p className="cc-eyebrow">{eyebrow}</p>}
      {title && <h2><WordReveal text={title} visible={vis} /></h2>}
      {intro && <p className="cc-intro">{intro}</p>}
    </header>
  );
}

/* ── Ambient particles ──
   Confetti for a birthday, stardust for a naming, embers for a griha
   pravesh. Positions come from the index rather than Math.random so the
   server and the client agree on them — a random left offset here is a
   hydration mismatch React warns about on every guest's first paint. */
function ParticleField({ kind, count, colors }) {
  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${((i * 100) / count + ((i * 37) % 11) - 5).toFixed(2)}%`,
        delay: `${((i * 0.83) % 9).toFixed(2)}s`,
        dur: `${(9 + ((i * 3.1) % 9)).toFixed(2)}s`,
        drift: `${-34 + ((i * 13) % 68)}px`,
        tint: colors[i % colors.length],
        spin: `${((i * 53) % 360)}deg`,
      })),
    [count, colors]
  );
  return (
    <div className={`cc-particles cc-particles-${kind}`} aria-hidden="true">
      {bits.map((b, i) => (
        <i
          key={i}
          style={{
            left: b.left,
            background: b.tint,
            animationDelay: b.delay,
            animationDuration: b.dur,
            "--cc-drift": b.drift,
            "--cc-spin": b.spin,
          }}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   THE DATE REVEALS

   The date is not simply printed. It is the one moment on the page the
   guest performs rather than scrolls past, and each theme performs it
   differently: a birthday rubs foil off, a naming unfolds a card, a
   housewarming opens a door. Until it happens the hero and the
   invitation card both say so rather than showing the date they are
   hiding.
   ══════════════════════════════════════════════════════════════════════ */

/* Foil, erased with destination-out. `touch-action: none` is scoped to
   this box alone so rubbing it does not fight the page scroll, and there
   is a plain button underneath for anyone on a keyboard or a screen
   reader. */
function ScratchPanel({ onDone, accent = "#f0a63c", deep = "#5a1b3d", hint = "Rub to reveal" }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const stateRef = useRef({ drawing: false, done: false });

  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    if (!wrap || !cv) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const box = wrap.getBoundingClientRect();
    const w = Math.max(1, Math.round(box.width));
    const h = Math.max(1, Math.round(box.height));
    cv.width = w * dpr;
    cv.height = h * dpr;
    cv.style.width = `${w}px`;
    cv.style.height = `${h}px`;

    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    /* A brushed diagonal sweep so the panel reads as foil rather than a
       grey box. */
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, deep);
    g.addColorStop(0.42, accent);
    g.addColorStop(0.58, "#f4e3b8");
    g.addColorStop(1, deep);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#fff";
    for (let i = -h; i < w; i += 7) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + h, h);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const pointAt = (e) => {
      const r = cv.getBoundingClientRect();
      const p = e.touches?.[0] || e;
      return { x: p.clientX - r.left, y: p.clientY - r.top };
    };

    const rub = (e) => {
      if (!stateRef.current.drawing || stateRef.current.done) return;
      const { x, y } = pointAt(e);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    };

    /* Sampling every pixel on every move is wasteful; a coarse grid is
       plenty to decide when enough foil has gone. */
    const cleared = () => {
      const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0, total = 0;
      for (let i = 3; i < data.length; i += 4 * 40) {
        total += 1;
        if (data[i] < 24) clear += 1;
      }
      return total ? clear / total : 0;
    };

    const finish = () => {
      if (stateRef.current.done) return;
      stateRef.current.done = true;
      onDone();
    };

    const up = () => {
      stateRef.current.drawing = false;
      if (cleared() > 0.42) finish();
    };
    const down = (e) => { stateRef.current.drawing = true; rub(e); };

    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", rub);
    window.addEventListener("pointerup", up);
    cv.addEventListener("pointerleave", up);

    return () => {
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", rub);
      window.removeEventListener("pointerup", up);
      cv.removeEventListener("pointerleave", up);
    };
  }, [onDone, accent, deep]);

  return (
    <div className="cc-scratch" ref={wrapRef}>
      <canvas ref={canvasRef} className="cc-scratch-canvas" aria-hidden="true" />
      <span className="cc-scratch-hint">{hint}</span>
    </div>
  );
}

/* The unfold and the doorway are the same mechanism — two leaves that
   move apart on a tap — so they share a component and differ in CSS:
   paper that folds back, or doors that swing on their hinges.

   It is a real <button>, so it answers the keyboard and the screen
   reader without a second control beside it, which is why the scratch
   panel needs a skip button and these two do not. */
function TapRevealPanel({ variant, onDone, label }) {
  const [opening, setOpening] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const open = useCallback(() => {
    if (opening) return;
    setOpening(true);
    /* The leaves take most of a second to move. Calling onDone straight
       away would swap the date in behind a card that is still visibly
       shut, and the whole gesture reads as a glitch. Someone who has
       asked for less motion gets the shorter wait, because for them the
       leaves are not moving at all. */
    const reduced =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = setTimeout(onDone, reduced ? 180 : 820);
  }, [opening, onDone]);

  return (
    <button
      type="button"
      className={`cc-tap cc-tap-${variant} ${opening ? "cc-tap-open" : ""}`}
      onClick={open}
    >
      <span className="cc-tap-leaf cc-tap-l" aria-hidden="true" />
      <span className="cc-tap-leaf cc-tap-r" aria-hidden="true" />
      <span className="cc-tap-hint">{label}</span>
    </button>
  );
}

/* ── Countdown ──
   Rendered only once the client has ticked. Counting down during the
   server render would put a different number in the HTML than in the
   first paint, which React reports as a hydration error on every single
   page load. */
function useCountdown(iso) {
  const target = useMemo(() => {
    const t = Date.parse(String(iso || ""));
    return Number.isFinite(t) ? t : null;
  }, [iso]);

  const [left, setLeft] = useState(null);

  useEffect(() => {
    if (target === null) { setLeft(null); return; }
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return left;
}

function Countdown({ iso, label }) {
  const left = useCountdown(iso);
  if (left === null) return null;
  if (left <= 0) return <p className="cc-countdown-done">{label} — today.</p>;

  const s = Math.floor(left / 1000);
  const units = [
    ["Days", Math.floor(s / 86400)],
    ["Hours", Math.floor((s % 86400) / 3600)],
    ["Minutes", Math.floor((s % 3600) / 60)],
    ["Seconds", s % 60],
  ];
  return (
    <div className="cc-countdown">
      <p className="cc-countdown-label">{label}</p>
      <div className="cc-countdown-row">
        {units.map(([name, value]) => (
          <div className="cc-countdown-unit" key={name}>
            <b>{String(value).padStart(2, "0")}</b>
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export default function CelebrationCinema({ tokens: rawTokens, preview = false }) {
  /* The kind lives on `_premium`; `eventKind` is the readable copy of it.
     Reading both means a config written by an older turn of the interview
     still routes to the right theme. */
  const kind = celebrationKind(rawTokens) || rawTokens?.eventKind || "birthday";
  const tokens = useMemo(() => hydrate(rawTokens, kind), [rawTokens, kind]);
  const theme = useMemo(() => themeFor(kind, tokens), [kind, tokens]);

  const { host, invitation, venue, events, story, media, social, rsvp } = tokens;
  const palette = theme.palette;
  const voice = theme.voice;

  const name = host.name || theme.empty.name;
  const second = host.secondName || "";
  const dated = parseDate(invitation.displayDate);

  const storyImages = list(media.storyImages);
  const galleryImages = list(media.galleryImages);

  /* The data a heading may want to speak. */
  const ctx = useMemo(
    () => ({
      name: host.name,
      secondName: host.secondName,
      age: host.age,
      role: host.role || voice.role,
      hosts: host.hosts,
      venue: venue.name,
    }),
    [host.name, host.secondName, host.age, host.role, host.hosts, venue.name, voice.role]
  );

  /* Opening state. In preview the invitation is already open: the host is
     editing their own page, not being surprised by it. */
  const [opened, setOpened] = useState(preview);
  const openInvitation = useCallback(() => setOpened(true), []);

  const [dateRevealed, setDateRevealed] = useState(preview);
  const revealDate = useCallback(() => setDateRevealed(true), []);

  /* Scroll progress */
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (preview) return;
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? window.scrollY / h : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [preview]);

  /* Which chapter is on screen. Read from the scenes themselves via
     data-chapter, so adding or reordering a scene in the theme cannot
     leave a stale label behind in a hard-coded list. */
  const [chapter, setChapter] = useState("");
  useEffect(() => {
    if (preview) return;
    const marked = Array.from(document.querySelectorAll("[data-chapter]"));
    if (!marked.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setChapter(hit.target.dataset.chapter);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.6, 1] }
    );
    marked.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [preview, story.length, events.length, theme.kind]);

  const style = useMemo(
    () => ({
      "--cc-primary": palette.primary,
      "--cc-secondary": palette.secondary,
      "--cc-accent": palette.accent,
      "--cc-paper": palette.paper,
      "--cc-text": palette.text,
    }),
    [palette]
  );

  const particleColors = useMemo(() => theme.particleColors(palette), [theme, palette]);

  const heading = (key) => {
    const h = theme.headings[key] || {};
    return { eyebrow: h.eyebrow, title: txt(h.title, ctx), intro: txt(h.intro, ctx) };
  };

  /* ── The scenes ──
     Each returns null when it has nothing to show, and the theme decides
     which of them appear and in what order. */
  const scene = (key) => {
    switch (key) {
      case "opening":
        return (
          <HeroScene
            key={key}
            theme={theme}
            palette={palette}
            tokens={tokens}
            name={name}
            second={second}
            dateRevealed={dateRevealed}
          />
        );

      case "date":
        if (!invitation.displayDate && !invitation.countdownAt) return null;
        return (
          <DateScene
            key={key}
            theme={theme}
            palette={palette}
            dated={dated}
            heading={heading("date")}
            revealed={dateRevealed}
            onReveal={revealDate}
            countdownAt={invitation.countdownAt}
          />
        );

      case "card":
        return (
          <InvitationCard
            key={key}
            theme={theme}
            palette={palette}
            tokens={tokens}
            name={name}
            second={second}
            dateRevealed={dateRevealed}
          />
        );

      case "about": {
        if (!host.intro && !host.secondIntro) return null;
        const h = heading("about");
        return (
          <section key={key} className="cc-scene" id="about" data-chapter={h.eyebrow}>
            <SceneHeading {...h} />
            <div className={`cc-people ${host.secondIntro ? "cc-people-two" : ""}`}>
              <PersonCard
                role={host.role || voice.role}
                name={name}
                intro={host.intro}
                photo={storyImages[0]}
                emptyPhoto={theme.empty.photo}
              />
              {host.secondIntro && (
                <PersonCard
                  role={host.role || voice.role}
                  name={second || theme.empty.name}
                  intro={host.secondIntro}
                  photo={storyImages[1]}
                  emptyPhoto={theme.empty.photo}
                />
              )}
            </div>
          </section>
        );
      }

      case "story": {
        if (!story.length) return null;
        const h = heading("story");
        /* When the About scene has already used the first photograph, the
           chapters start at the next one — otherwise the portrait appears
           twice in a row, once as a face and once as a chapter. */
        const offset = host.intro && storyImages.length > story.length ? 1 : 0;
        return (
          <section key={key} className="cc-scene" id="story" data-chapter={h.eyebrow}>
            <SceneHeading {...h} />
            <div className="cc-chapters">
              {story.map((ch, i) => (
                <StoryChapter
                  key={ch?.id || i}
                  chapter={ch}
                  index={i}
                  image={storyImages[i + offset]}
                />
              ))}
            </div>
          </section>
        );
      }

      case "programme": {
        if (!events.length) return null;
        const h = heading("programme");
        return (
          <section key={key} className="cc-scene" id="programme" data-chapter={h.eyebrow}>
            <SceneHeading {...h} />
            <div className="cc-timeline">
              <div className="cc-timeline-line" aria-hidden="true" />
              {events.map((ev, i) => (
                <EventCard
                  key={ev?.id || i}
                  event={ev || {}}
                  index={i}
                  total={events.length}
                  band={bandColor(ev, palette, i)}
                  fallbackVenue={[venue.name, venue.city].filter(Boolean).join(", ")}
                />
              ))}
            </div>
          </section>
        );
      }

      case "venue":
        if (!venue.name) return null;
        return <VenueScene key={key} venue={venue} heading={heading("venue")} />;

      case "rsvp": {
        /* The markup hook only. The real stepper is rendered by the guest
           page (app/i/[token]/page.js) directly beneath the template, the
           same way the wedding template leaves it — the form needs the
           guest record and the Supabase client, neither of which the
           template has. Rendering a second, dead form here would be the
           bug, not the feature. */
        if (!rsvp.enabled) return null;
        const h = heading("rsvp");
        return (
          <section key={key} className="cc-scene cc-rsvp-hook" id="rsvp" data-chapter={h.eyebrow}>
            <SceneHeading {...h} />
            {(rsvp.note || rsvp.deadline) && (
              <p className="cc-rsvp-note">
                {rsvp.note || `Kindly reply by ${rsvp.deadline}.`}
              </p>
            )}
            <div className="cc-rsvp-slot" data-celebration-rsvp="" />
          </section>
        );
      }

      case "wishes": {
        /* Same contract as the wedding template: the wall of messages is
           rendered by the guest page, which is the only place that has
           them. This is the lead-in and the anchor. */
        const h = heading("wishes");
        return (
          <section key={key} className="cc-scene cc-wishes-hook" id="wishes" data-chapter={h.eyebrow}>
            <SceneHeading {...h} />
            <div className="cc-wishes-slot" data-celebration-wishes="" />
          </section>
        );
      }

      case "gallery": {
        if (!galleryImages.length) return null;
        const h = heading("gallery");
        return (
          <section key={key} className="cc-scene" id="gallery" data-chapter={h.eyebrow}>
            <SceneHeading {...h} />
            <div className="cc-gallery">
              {galleryImages.map((url, i) => (
                <figure className="cc-frame-photo" key={i}>
                  <img src={url} alt={`${name} — photograph ${i + 1}`} loading="lazy" />
                  <figcaption>{String(i + 1).padStart(2, "0")}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        );
      }

      case "share": {
        if (!social.hashtag && !social.instagram) return null;
        const h = heading("share");
        const handle = String(social.instagram || "").replace(/^@/, "");
        return (
          <section key={key} className="cc-scene cc-share" id="share" data-chapter={h.eyebrow}>
            <SceneHeading {...h} />
            {social.hashtag && (
              <div className="cc-hashtag">#{String(social.hashtag).replace(/^#/, "")}</div>
            )}
            <p className="cc-share-note">{voice.shareNote}</p>
            {handle && (
              /* instagram.com/_u/<handle> is the link the app intercepts on
                 a phone, so guests land in Instagram itself rather than a
                 browser tab; on a laptop it redirects to the ordinary
                 profile page. */
              <a
                className="cc-share-cta"
                href={`https://instagram.com/_u/${encodeURIComponent(handle)}`}
                target="_blank"
                rel="noreferrer"
              >
                Post a story · @{handle}
              </a>
            )}
          </section>
        );
      }

      case "closing":
        return (
          <ClosingFooter
            key={key}
            theme={theme}
            palette={palette}
            invitation={invitation}
            media={media}
            name={name}
            second={second}
            hosts={host.hosts}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`cc ${theme.className} ${preview ? "cc-preview" : ""}`} style={style}>
      {/* Ambient glow */}
      <div className="cc-ambient" aria-hidden="true"><i /><i /><i /></div>

      <ParticleField
        kind={theme.particles}
        count={preview ? 7 : 16}
        colors={particleColors}
      />

      {!preview && (
        <div className="cc-progress" aria-hidden="true">
          <div className="cc-progress-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>
      )}

      {/* Where the guest is in a long scroll. */}
      {!preview && chapter && <div className="cc-chip" aria-hidden="true">{chapter}</div>}

      {!preview && (
        <OpeningOverlay
          theme={theme}
          palette={palette}
          opened={opened}
          onOpen={openInvitation}
          title={second ? `${name} & ${second}` : name}
        />
      )}

      {theme.scenes.map((key) => scene(key))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════════════ */

/* The overlay is `position: fixed`, and its two panels are transformed.
   That is safe in this direction only: the panels are DESCENDANTS of the
   fixed layer, not ancestors of it. Nothing that wraps `.cc` may ever
   animate a transform — a transformed ancestor becomes the containing
   block for every fixed child, and the whole opening lands halfway down
   the page instead of over the screen. See the warning block at the head
   of app/celebration.css; this shipped as a real bug once already. */
function OpeningOverlay({ theme, palette, opened, onOpen, title }) {
  return (
    <div className={`cc-opening cc-opening-${theme.opening} ${opened ? "cc-opened" : ""}`}>
      <div className="cc-opening-panels" aria-hidden="true"><div /><div /></div>
      <div className="cc-opening-orn" aria-hidden="true">
        <theme.OpeningOrnament palette={palette} />
      </div>
      <div className="cc-opening-title" aria-hidden="true">{title}</div>
      <button type="button" className="cc-opening-trigger" onClick={onOpen}>
        {theme.voice.openCue}
      </button>
    </div>
  );
}

function HeroScene({ theme, palette, tokens, name, second, dateRevealed }) {
  const { invitation, host, media } = tokens;
  const voice = theme.voice;
  return (
    <section className="cc-hero" data-chapter={voice.kicker}>
      {media.heroImageUrl ? (
        <img className="cc-hero-media" src={media.heroImageUrl} alt="" />
      ) : (
        <div className="cc-hero-media cc-hero-media-empty" />
      )}
      <div className="cc-hero-vignette" aria-hidden="true" />

      <div className="cc-hero-copy">
        <p className="cc-eyebrow">{invitation.kicker || voice.kicker}</p>
        <div className="cc-hero-motif" aria-hidden="true">
          <theme.Motif palette={palette} tokens={tokens} />
        </div>
        <h1>
          <span>{name}</span>
          {second && <em>&amp;</em>}
          {second && <span>{second}</span>}
        </h1>
        {host.age && <p className="cc-hero-age">{host.age} birthday</p>}
        {invitation.headline && <p className="cc-hero-headline">{invitation.headline}</p>}
        {invitation.message && <p className="cc-hero-message">{invitation.message}</p>}
        {invitation.displayDate && (
          <div className={`cc-hero-date ${dateRevealed ? "" : "cc-waiting"}`}>
            {dateRevealed ? invitation.displayDate : voice.waiting}
          </div>
        )}
        <a className="cc-hero-cta" href="#card">
          {voice.scrollCue} <ChevronDown size={16} />
        </a>
      </div>
    </section>
  );
}

function DateScene({ theme, palette, dated, heading, revealed, onReveal, countdownAt }) {
  const [ref, vis] = useReveal();
  const voice = theme.voice;
  const hasLockup = Boolean(dated.day || dated.month || dated.year);

  return (
    <section ref={ref} className="cc-scene cc-date-scene" id="date" data-chapter={heading.eyebrow}>
      <div className="cc-date-halo" aria-hidden="true" />
      <p className="cc-eyebrow cc-center">{voice.dateEyebrow}</p>

      {hasLockup && (
        <div className="cc-date-stack">
          <div className={`cc-date-lockup cc-fade ${vis ? "cc-visible" : ""}`}>
            {dated.day && <b className="cc-date-day">{dated.day}</b>}
            {dated.month && <span className="cc-date-month">{dated.month}</span>}
            {dated.year && <i className="cc-date-year">{dated.year}</i>}
          </div>

          {!revealed && theme.dateReveal === "scratch" && (
            <ScratchPanel
              onDone={onReveal}
              accent={palette.accent}
              deep={palette.primary}
              hint={voice.hintBefore}
            />
          )}
          {!revealed && theme.dateReveal !== "scratch" && (
            <TapRevealPanel
              variant={theme.dateReveal}
              onDone={onReveal}
              label={voice.revealLabel}
            />
          )}
        </div>
      )}

      {/* Rubbing is a pointer gesture, so the scratch variant needs a
          second door for anyone on a keyboard, a screen reader, or simply
          out of patience. The tap variants are already buttons. */}
      {!revealed && hasLockup && theme.dateReveal === "scratch" && (
        <button type="button" className="cc-date-skip" onClick={onReveal}>
          {voice.revealLabel}
        </button>
      )}

      <p className="cc-date-hint">{revealed ? voice.hintAfter : voice.hintBefore}</p>

      <div className="cc-date-orn" aria-hidden="true">
        <theme.DateOrnament palette={palette} />
      </div>

      {revealed && countdownAt && <Countdown iso={countdownAt} label={voice.countdownLabel} />}
    </section>
  );
}

function InvitationCard({ theme, palette, tokens, name, second, dateRevealed }) {
  const [ref, vis] = useReveal();
  const { invitation, venue, host } = tokens;
  const voice = theme.voice;

  return (
    <section ref={ref} className="cc-scene" id="card" data-chapter={theme.headings.card?.eyebrow}>
      <div className={`cc-card cc-fade ${vis ? "cc-visible" : ""}`}>
        <theme.CardFrame palette={palette} />
        <theme.CardCorners palette={palette} />

        <div className="cc-card-inner">
          <div className="cc-card-crest" aria-hidden="true">
            <theme.CardCrest palette={palette} tokens={tokens} />
          </div>

          {invitation.blessingLine && <p className="cc-card-blessing">{invitation.blessingLine}</p>}

          <p className="cc-card-kicker">{invitation.kicker || voice.kicker}</p>

          <h1 className="cc-card-name">
            {name}
            {second && <em>&amp;</em>}
            {second && <span>{second}</span>}
          </h1>

          {(host.role || host.age) && (
            <p className="cc-card-role">
              {[host.age, host.role || voice.role].filter(Boolean).join(" · ")}
            </p>
          )}

          {invitation.message && <p className="cc-card-message">{invitation.message}</p>}

          <div className="cc-card-rule" aria-hidden="true">
            <theme.Rule palette={palette} />
          </div>

          {invitation.displayDate && (
            <>
              <p className="cc-card-date-label">{voice.dateEyebrow}</p>
              <p className={`cc-card-date ${dateRevealed ? "" : "cc-waiting"}`}>
                {dateRevealed ? invitation.displayDate : voice.cardWaiting}
              </p>
            </>
          )}

          {venue.name && (
            <p className="cc-card-venue">
              {venue.name}{venue.city ? `, ${venue.city}` : ""}
            </p>
          )}

          <p className="cc-card-hosts">{host.hosts || theme.empty.hosts}</p>
        </div>
      </div>
    </section>
  );
}

function PersonCard({ role, name, intro, photo, emptyPhoto }) {
  const [ref, vis] = useReveal();
  return (
    <article ref={ref} className={`cc-person cc-fade ${vis ? "cc-visible" : ""}`}>
      <div className="cc-person-photo">
        {photo ? (
          <img src={photo} alt={name} loading="lazy" />
        ) : (
          /* No portrait yet. An initial in a ring is a deliberate empty
             state; a broken image icon is an accident. */
          <div className="cc-person-photo-empty" title={emptyPhoto}>
            {String(name || "?").charAt(0)}
          </div>
        )}
      </div>
      {role && <div className="cc-person-role">{role}</div>}
      <div className="cc-person-name">{name}</div>
      {intro && <p className="cc-person-intro">{intro}</p>}
    </article>
  );
}

function StoryChapter({ chapter, index, image }) {
  const [ref, vis] = useReveal();
  const ch = chapter || {};
  /* `body` is the field on this schema. `description` only ever appears on
     an invitation saved against the older wedding-shaped payload, and
     dropping it would blank a chapter someone already published. */
  const copy = ch.body || ch.description || "";
  return (
    <article ref={ref} className={`cc-chapter cc-fade ${vis ? "cc-visible" : ""}`}>
      {image && (
        <div className="cc-chapter-image">
          <img src={image} alt={ch.title || `Chapter ${index + 1}`} loading="lazy" />
        </div>
      )}
      <div className="cc-chapter-copy">
        <div className="cc-chapter-number">{String(index + 1).padStart(2, "0")}</div>
        {ch.title && <h3>{ch.title}</h3>}
        {copy && <p>{copy}</p>}
      </div>
    </article>
  );
}

/* The colour band on a programme card. A theme string like "Sunshine
   Yellow" is words, not a colour, so the band walks the palette instead
   of trying to parse English — unless the host actually gave a hex, in
   which case that is what they meant. */
function bandColor(event, palette, i) {
  const hex = String(event?.theme || "").match(/#[0-9a-fA-F]{3,8}\b/);
  if (hex) return hex[0];
  const wheel = [palette.accent, palette.secondary, palette.primary];
  return wheel[i % wheel.length];
}

/* "Add to calendar". A Google Calendar template URL rather than a
   downloaded .ics: a phone opens it in the calendar app already signed
   in, and there is no file for the guest to find. Only offered when the
   item actually carries a date — a button that adds an event at an
   unknown time is worse than no button. */
function calendarHref(event, fallbackVenue) {
  const date = String(event?.date || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  const pad = (s, d) => (s || d).padStart(2, "0");
  const [sh, sm] = String(event.time || "").split(":");
  const startH = pad(sh, "11");
  const start = `${date.replace(/-/g, "")}T${startH}${pad(sm, "00")}00`;
  const endH = String(Math.min(23, Number(startH) + 2)).padStart(2, "0");
  const end = `${date.replace(/-/g, "")}T${endH}${pad(sm, "00")}00`;
  const where = [event.venue, event.address || fallbackVenue].filter(Boolean).join(", ");
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name || "Celebration",
    dates: `${start}/${end}`,
    location: where,
    details: event.note || "",
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

function EventCard({ event, index, total, band, fallbackVenue }) {
  const [ref, vis] = useReveal();
  const cal = calendarHref(event, fallbackVenue);
  return (
    <article ref={ref} className={`cc-event cc-fade ${vis ? "cc-visible" : ""}`}>
      <span className="cc-event-dot" style={{ background: band }} aria-hidden="true" />
      <div className="cc-event-card">
        <div className="cc-event-band" style={{ background: band }} aria-hidden="true" />
        <div className="cc-event-copy">
          <div className="cc-event-number">{String(index + 1).padStart(2, "0")} / {total}</div>
          {event.name && <h3>{event.name}</h3>}
          {(event.time || event.date) && (
            <p className="cc-event-time">{[event.date, event.time].filter(Boolean).join(" · ")}</p>
          )}
          {event.venue && <p className="cc-event-venue">{event.venue}</p>}
          {event.address && <address className="cc-event-address">{event.address}</address>}
          {event.note && <p className="cc-event-note">{event.note}</p>}
          <div className="cc-event-tags">
            {event.theme && <span className="cc-tag" style={{ borderColor: band, color: band }}>{event.theme}</span>}
            {event.dressCode && <span className="cc-tag cc-tag-plain">Dress: {event.dressCode}</span>}
          </div>
          {cal && (
            <a className="cc-event-cal" href={cal} target="_blank" rel="noreferrer">
              <Calendar size={13} /> Add to calendar
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function VenueScene({ venue, heading }) {
  return (
    <section className="cc-scene cc-venue-scene" id="venue" data-chapter={heading.eyebrow}>
      <SceneHeading eyebrow={heading.eyebrow} title={venue.name || heading.title} intro={venue.description} />

      {(venue.address || venue.city) && (
        <address className="cc-venue-address">
          {[venue.address, venue.city, venue.country].filter(Boolean).join(", ")}
        </address>
      )}

      {(venue.parking || venue.nearestTransport || venue.directions) && (
        <div className="cc-venue-details">
          {venue.parking && <div className="cc-venue-detail"><span>Parking</span><p>{venue.parking}</p></div>}
          {venue.nearestTransport && <div className="cc-venue-detail"><span>Nearest transport</span><p>{venue.nearestTransport}</p></div>}
          {venue.directions && <div className="cc-venue-detail"><span>Directions</span><p>{venue.directions}</p></div>}
        </div>
      )}

      {venue.mapQuery && (
        <div className="cc-venue-map">
          <iframe
            src={`https://www.google.com/maps?q=${encodeURIComponent(venue.mapQuery)}&output=embed`}
            title={`${venue.name} map`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      {/* A pasted link is the exact pin the host chose; a query is our
          guess at it, so the link wins for the button. The embed still has
          to use the query — Google will not render a short goo.gl link
          inside an iframe. */}
      {(venue.mapLink || venue.mapQuery) && (
        <a
          className="cc-venue-cta"
          href={safeMapHref(venue.mapLink) || `https://maps.google.com/?q=${encodeURIComponent(venue.mapQuery)}`}
          target="_blank"
          rel="noreferrer"
        >
          <MapPin size={16} /> Open in Maps
        </a>
      )}
    </section>
  );
}

/* The last thing a guest sees: the thank-you, set over a full-width
   photograph rather than beside a small one. Falling back to the opening
   photograph keeps this scene from being a block of flat colour when the
   host skipped the last question — it is the one picture the invitation
   is certain to have. */
function ClosingFooter({ theme, palette, invitation, media, name, second, hosts }) {
  const [ref, vis] = useReveal();
  const backdrop = media?.closingImage || media?.heroImageUrl;
  const note = invitation.thankYouNote;

  return (
    <footer
      ref={ref}
      className={`cc-closing cc-fade ${backdrop ? "cc-closing-hasimage" : ""} ${vis ? "cc-visible" : ""}`}
    >
      {backdrop && (
        <>
          <img className="cc-closing-backdrop" src={backdrop} alt="" aria-hidden="true" />
          <div className="cc-closing-veil" aria-hidden="true" />
        </>
      )}
      <div className="cc-closing-copy">
        <div className="cc-closing-crest" aria-hidden="true">
          <theme.Rule palette={palette} />
        </div>
        {note && <p className="cc-closing-message">{note}</p>}
        <h2>
          {name}
          {second && <em>&amp;</em>}
          {second && <span>{second}</span>}
        </h2>
        {hosts && <p className="cc-closing-hosts">{hosts}</p>}
        <small>{theme.voice.signature}</small>
      </div>
    </footer>
  );
}
