"use client";

import { Fragment, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { MapPin, Calendar, ChevronDown } from "lucide-react";
import { emptyWeddingTokens } from "@/lib/design/wedding-tokens";
import { BulbFrame, Lantern, FloralCorner, DeityMedallion, RuleOrnament } from "@/components/wedding/ornaments";

/* ══════════════════════════════════════════════════════════════════════
   WEDDING CINEMA — Cinematic scroll-driven wedding invitation

   Props:
     tokens  – the wedding token object (from lib/design/wedding-tokens.js)
     preview – true when inside the PhoneFrame on the create page
     guest   – guest object when viewing as a guest (RSVP enabled)
   ══════════════════════════════════════════════════════════════════════ */

/* ── Helpers ── */
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

/* Mix a hex colour towards white. Used for petal faces, so a bloom drawn
   from any palette keeps a light side and a shadow side. */
function lighten(hex, t) {
  const v = String(hex || "").replace("#", "");
  const x = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
  if (x.length < 6) return hex;
  const n = parseInt(x.slice(0, 6), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(c + (255 - c) * t)
  );
  return "#" + ch.map((c) => c.toString(16).padStart(2, "0")).join("");
}

function monogram(bride, groom) {
  return `${(bride || "A").charAt(0)}${(groom || "V").charAt(0)}`;
}

function parseDate(displayDate) {
  if (!displayDate) return { day: "", month: "", year: "" };
  const parts = displayDate.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
  if (parts) return { day: parts[1], month: parts[2], year: parts[3] };
  return { day: "", month: displayDate, year: "" };
}

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

/* ── Word-by-word reveal component ──
   The space goes BETWEEN the spans, not inside them. `.wc-word` is an
   inline-block, and an inline-block drops its own trailing whitespace —
   so with the space inside, every scene heading on the page rendered as
   "Sharethecelebrationwithus". A bare text node between the boxes is a
   real space and still gives the line somewhere to break. */
function WordReveal({ text, visible, delay = 0 }) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  return words.map((word, i) => (
    <Fragment key={i}>
      <span
        className={`wc-word ${visible ? "wc-revealed" : ""}`}
        style={{ transitionDelay: `${delay + i * 80}ms` }}
      >
        {word}
      </span>
      {i < words.length - 1 ? " " : null}
    </Fragment>
  ));
}

/* ── Petal field ── */
function PetalField({ count = 12 }) {
  const petals = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      left: ((i * 100) / count + (Math.random() * 6 - 3)) + "%",
      delay: (i * 0.83) + "s",
      dur: (10 + Math.random() * 8) + "s",
      drift: Math.round(-32 + i * 5.5) + "px",
    })),
  [count]);
  return (
    <div className="wc-petals" aria-hidden="true">
      {petals.map((p, i) => (
        <i key={i} style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur, "--petal-drift": p.drift }} />
      ))}
    </div>
  );
}

/* ── Section heading ── */
function SceneHeading({ eyebrow, title, intro }) {
  const [ref, vis] = useReveal();
  return (
    <header ref={ref} className="wc-scene-heading">
      {eyebrow && <p className="wc-eyebrow">{eyebrow}</p>}
      <h2><WordReveal text={title} visible={vis} /></h2>
      {intro && <p className="wc-intro">{intro}</p>}
    </header>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SCRATCH TO REVEAL

   The date is not printed on the invitation — it is under a panel of gold
   foil that the guest rubs away, and until they do, the hero reads "the
   date awaits its reveal" and the card underneath says "reveal the date
   above". It is the one moment on the page the guest performs rather than
   scrolls past, and it is the reason the date scene exists at all.

   The canvas starts covered and is erased with destination-out; once
   enough of it is gone the whole panel fades and the date stays revealed.
   `touch-action: none` is scoped to this box alone so rubbing it does not
   fight the page scroll, and there is a plain button underneath for
   anyone using a keyboard or a screen reader.
   ══════════════════════════════════════════════════════════════════════ */
function ScratchPanel({ onDone, accent = "#c69a55", deep = "#3a2230" }) {
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
    ctx.scale(dpr, dpr);

    /* The foil itself: a brushed diagonal sweep so it reads as leaf
       rather than a grey box. */
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, deep);
    g.addColorStop(0.42, accent);
    g.addColorStop(0.58, "#f0dcae");
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
    <div className="wc-scratch" ref={wrapRef}>
      <canvas ref={canvasRef} className="wc-scratch-canvas" aria-hidden="true" />
      <span className="wc-scratch-hint">Rub to reveal</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════════ */
export default function WeddingCinema({ tokens: rawTokens, preview = false, guest = null }) {
  const tokens = useMemo(() => ({ ...emptyWeddingTokens(), ...rawTokens }), [rawTokens]);

  const { couple, invitation, venue, events, story, media, social } = tokens;
  const bride = couple.bride || "Bride";
  const groom = couple.groom || "Groom";
  const mono = monogram(bride, groom);
  const dated = parseDate(invitation.displayDate);

  /* Opening state */
  const [opened, setOpened] = useState(preview);
  const openInvitation = useCallback(() => setOpened(true), []);

  /* The date stays under the foil until the guest rubs it off. In the
     create-page preview it is already revealed — the couple are editing
     their own invitation, not being surprised by it. */
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
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [preview]);

  /* Which chapter is on screen. Read from the scenes themselves via
     data-chapter, so adding or removing a scene cannot leave a stale
     label behind in a hard-coded list. */
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
  }, [preview, story.length, events.length]);

  /* Set CSS custom properties from palette */
  const style = useMemo(() => {
    const p = tokens.palette || {};
    return {
      "--wc-primary": p.primary || "#8f294e",
      "--wc-secondary": p.secondary || "#7b594e",
      "--wc-accent": p.accent || "#c69a55",
      "--wc-paper": p.paper || "#fff8ea",
      "--wc-text": p.text || "#4f392f",
    };
  }, [tokens.palette]);

  return (
    <div className={`wc ${preview ? "wc-preview" : ""}`} style={style}>

      {/* Ambient glow */}
      <div className="wc-ambient" aria-hidden="true"><i /><i /><i /></div>

      {/* Floating petals */}
      <PetalField count={preview ? 6 : 12} />

      {/* Progress bar */}
      {!preview && (
        <div className="wc-progress" aria-hidden="true">
          <div className="wc-progress-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>
      )}

      {/* The chapter the guest is currently in, as a pill in the corner —
          a long scroll needs somewhere to tell you where you are. */}
      {!preview && chapter && (
        <div className="wc-chapter-chip" aria-hidden="true">{chapter}</div>
      )}

      {/* ── Opening overlay ── */}
      {!preview && (
        <div className={`wc-opening ${opened ? "wc-opened" : ""}`}>
          <div className="wc-opening-panels"><div /><div /></div>
          <div className="wc-opening-monogram">{mono}</div>
          <button className="wc-opening-trigger" onClick={openInvitation}>
            Tap to open
          </button>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="wc-hero">
        {media.heroImageUrl && (
          <img className="wc-hero-media" src={media.heroImageUrl} alt="" />
        )}
        {!media.heroImageUrl && (
          <div className="wc-hero-media" style={{ background: "linear-gradient(135deg, #160e10, #0c0608)" }} />
        )}
        <div className="wc-hero-vignette" />
        <div className="wc-hero-copy">
          <p className="wc-eyebrow">{invitation.kicker || "Together With Their Families"}</p>
          <h1>
            <span>{bride}</span>
            <em>&amp;</em>
            <span>{groom}</span>
          </h1>
          {invitation.message && <p className="wc-hero-message">{invitation.message}</p>}
          {invitation.displayDate && (
            <div className={`wc-hero-date ${dateRevealed ? "" : "wc-hero-date-waiting"}`}>
              {dateRevealed ? invitation.displayDate : "The date awaits its reveal"}
            </div>
          )}
          <a className="wc-hero-cta" href="#story">
            Begin the story <ChevronDown size={16} />
          </a>
        </div>
        <div className="wc-hero-ornament" aria-hidden="true">{mono}</div>
      </section>

      {/* ── DATE REVEAL ── */}
      {invitation.displayDate && (
        <DateScene
          dated={dated}
          revealed={dateRevealed}
          onReveal={revealDate}
          accent={style["--wc-accent"]}
          deep={style["--wc-primary"]}
        />
      )}

      {/* ── INVITATION CARD ── */}
      <InvitationCard
        couple={couple}
        invitation={invitation}
        venue={venue}
        mono={mono}
        bride={bride}
        groom={groom}
        dated={dated}
        dateRevealed={dateRevealed}
        palette={tokens.palette}
      />

      {/* ── COUPLE ── */}
      {(couple.brideIntro || couple.groomIntro) && (
        <section className="wc-scene">
          <SceneHeading eyebrow="Meet the Couple" title={`Two lives, one luminous chapter`} intro={couple.blessingLine} />
          <div className="wc-couple-grid">
            <CoupleCard role="The Bride" name={bride} intro={couple.brideIntro} photo={couple.bridePhoto} />
            <CoupleCard role="The Groom" name={groom} intro={couple.groomIntro} photo={couple.groomPhoto} />
          </div>
        </section>
      )}

      {/* ── LOVE STORY ── */}
      {story.length > 0 && (
        <section className="wc-scene" id="story" data-chapter="Our story">
          <SceneHeading
            eyebrow="Their Story"
            title="A collection of beautiful almosts becoming forever"
          />
          <div className="wc-story-chapters">
            {story.map((ch, i) => (
              <StoryChapter key={ch.id || i} chapter={ch} index={i} image={media.storyImages?.[i]} />
            ))}
          </div>
        </section>
      )}

      {/* ── EVENTS TIMELINE ── */}
      {events.length > 0 && (
        <section className="wc-scene" id="events" data-chapter="The celebrations">
          <SceneHeading
            eyebrow="The Celebrations"
            title="A wedding told in ceremonies, colour, music and light"
          />
          <div className="wc-timeline">
            <div className="wc-timeline-line" aria-hidden="true" />
            {events.map((ev, i) => (
              <EventCard
                key={ev.id || i}
                event={ev}
                index={i}
                total={events.length}
                fallbackVenue={[venue.name, venue.city].filter(Boolean).join(", ")}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── GALLERY ── */}
      {media.galleryImages?.length > 0 && (
        <section className="wc-scene" id="gallery" data-chapter="Gallery">
          <SceneHeading eyebrow="A Few Favourite Frames" title="Gallery" intro="Scroll through the photographs that brought us here." />
          <div className="wc-gallery-scroll">
            {media.galleryImages.map((url, i) => (
              <figure className="wc-gallery-frame" key={i}>
                <img src={url} alt={`Wedding memory ${i + 1}`} loading="lazy" />
                <figcaption>{String(i + 1).padStart(2, "0")}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ── VENUE ── */}
      {venue.name && (
        <section className="wc-venue-scene" id="venue" data-chapter="The destination">
          <SceneHeading
            eyebrow="The Destination"
            title={venue.name}
            intro={venue.description}
          />
          {venue.address && <address className="wc-venue-address">{venue.address}{venue.city ? `, ${venue.city}` : ""}{venue.state ? `, ${venue.state}` : ""}</address>}
          {(venue.parking || venue.nearestTransport || venue.directions) && (
            <div className="wc-venue-details">
              {venue.parking && <div className="wc-venue-detail"><span>Parking</span><p>{venue.parking}</p></div>}
              {venue.nearestTransport && <div className="wc-venue-detail"><span>Nearest Transport</span><p>{venue.nearestTransport}</p></div>}
              {venue.directions && <div className="wc-venue-detail"><span>Directions</span><p>{venue.directions}</p></div>}
            </div>
          )}
          {venue.mapQuery && (
            <div className="wc-venue-map">
              <iframe
                src={`https://www.google.com/maps?q=${encodeURIComponent(venue.mapQuery)}&output=embed`}
                title={`${venue.name} map`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
          {/* A pasted link is the exact pin the couple chose; a query is
              our guess at it, so the link wins for the button. The embed
              still has to use the query — Google will not render a short
              goo.gl link inside an iframe. */}
          {(venue.mapLink || venue.mapQuery) && (
            <a
              className="wc-venue-cta"
              href={safeMapHref(venue.mapLink) || `https://maps.google.com/?q=${encodeURIComponent(venue.mapQuery)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={16} /> Open in Maps
            </a>
          )}
        </section>
      )}

      {/* ── SOCIAL / HASHTAG ── */}
      {(social.hashtag || social.instagram) && (
        <section className="wc-scene" id="share" data-chapter="Share">
          <SceneHeading eyebrow="Share the Moment" title="Share the celebration with us" />
          {social.hashtag && <div className="wc-hashtag">#{social.hashtag}</div>}
          <p className="wc-share-note">
            Share your favourite moments and tag the couple after the celebration.
          </p>
          {social.instagram && (
            /* Opens the couple's Instagram. instagram.com/_u/<handle> is
               the link the app intercepts on a phone, so guests land in
               Instagram itself rather than a browser tab; on a laptop it
               redirects to the ordinary profile page. */
            <a
              className="wc-share-cta"
              href={`https://instagram.com/_u/${encodeURIComponent(String(social.instagram).replace(/^@/, ""))}`}
              target="_blank"
              rel="noreferrer"
            >
              Post a story · @{String(social.instagram).replace(/^@/, "")}
            </a>
          )}
        </section>
      )}

      {/* ── CLOSING ── */}
      <ClosingFooter
        couple={couple}
        invitation={invitation}
        media={media}
        mono={mono}
        bride={bride}
        groom={groom}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════════════════════════════════════ */

function DateScene({ dated, revealed, onReveal, accent, deep }) {
  const [ref, vis] = useReveal();
  return (
    <section ref={ref} className="wc-scene wc-date-scene">
      <div className="wc-date-halo" aria-hidden="true" />
      <p className="wc-eyebrow" style={{ textAlign: "center" }}>The date is written</p>

      <div className="wc-date-stack">
        <div className={`wc-date-lockup wc-fade ${vis ? "wc-visible" : ""}`}>
          {dated.day && <b className="wc-date-day">{dated.day}</b>}
          {dated.month && <span className="wc-date-month">{dated.month}</span>}
          {dated.year && <i className="wc-date-year" style={{ fontStyle: "normal" }}>{dated.year}</i>}
        </div>
        {!revealed && <ScratchPanel onDone={onReveal} accent={accent} deep={deep} />}
      </div>

      {!revealed && (
        /* Rubbing is a pointer gesture. This is the same door for anyone
           on a keyboard, a screen reader, or simply out of patience. */
        <button type="button" className="wc-date-skip" onClick={onReveal}>
          Reveal the date
        </button>
      )}

      <p className="wc-date-hint">
        {revealed ? "Save it in your hearts & calendars" : "Rub the foil away"}
      </p>
    </section>
  );
}

/* The symbol at the head of the invitation card. This used to be a
   hard-coded ॐ, which is the right mark on a Hindu card and the wrong one
   on every other — a Christian or Muslim family opened their own
   invitation and found someone else's faith at the top of it. The
   interview asks once; anything unrecognised falls back to the neutral
   ornament rather than guessing. */
const FAITH_MARK = {
  hindu: "ॐ",
  jain: "ॐ",
  muslim: "☪",
  christian: "✝",
  catholic: "✝",
  sikh: "☬",
  buddhist: "☸",
  interfaith: "✦",
  none: "✦",
};

function InvitationCard({ couple, invitation, venue, mono, bride, groom, dated, dateRevealed, palette }) {
  const [ref, vis] = useReveal();
  const faith = String(invitation.religion || "").trim().toLowerCase();
  const mark = FAITH_MARK[faith] || "✦";
  const gold = palette?.accent || "#c69a55";
  const deepBloom = palette?.primary || "#8f294e";
  /* The petals need two tones or the gradient collapses and the cluster
     reads as a maroon blob. Lift the palette's own primary towards pink
     for the face of the petal and keep the original for its shadow. */
  const bloom = lighten(deepBloom, 0.42);

  return (
    <section ref={ref} className="wc-scene" id="families" data-chapter="The families">
      <div className={`wc-inv-card wc-fade ${vis ? "wc-visible" : ""}`}>
        {/* The frame: festoon bulbs all the way round, lanterns hung
            inside them, blooms in two corners. All drawn, no assets. */}
        <BulbFrame gold={gold} />
        <span className="wc-lantern-slot wc-lantern-l"><Lantern gold={gold} cord={40} /></span>
        <span className="wc-lantern-slot wc-lantern-r"><Lantern gold={gold} cord={58} /></span>
        <span className="wc-floral-slot wc-floral-bl"><FloralCorner id="bl" bloom={bloom} deep={deepBloom} /></span>
        <span className="wc-floral-slot wc-floral-br"><FloralCorner id="br" bloom={bloom} deep={deepBloom} /></span>

        <div className="wc-inv-inner">
          <DeityMedallion mark={mark} gold={gold} />
          {invitation.deityLine && <p className="wc-inv-deity">{invitation.deityLine}</p>}

          {couple.hosts && <p className="wc-inv-parents">{couple.hosts}</p>}
          <p className="wc-inv-kicker">{invitation.kicker || "Together With Their Families"}</p>
          <div className="wc-inv-monogram">{mono}</div>
          {invitation.message && <p className="wc-inv-message">{invitation.message}</p>}
          <h1>
            <span>{bride}</span>
            <em>&amp;</em>
            <span>{groom}</span>
          </h1>

          <div className="wc-inv-divider"><RuleOrnament gold={gold} /></div>

          {invitation.displayDate && (
            <>
              <p className="wc-inv-date-label">Wedding Date</p>
              <p className={`wc-inv-date ${dateRevealed ? "" : "wc-inv-date-waiting"}`}>
                {dateRevealed ? invitation.displayDate : "Reveal the date above"}
              </p>
            </>
          )}
          {venue.name && <p className="wc-inv-venue">{venue.name}{venue.city ? `, ${venue.city}` : ""}</p>}
        </div>
      </div>
    </section>
  );
}

function CoupleCard({ role, name, intro, photo }) {
  const [ref, vis] = useReveal();
  return (
    <article ref={ref} className={`wc-couple-card wc-fade ${vis ? "wc-visible" : ""}`}>
      <div className="wc-couple-photo">
        {photo ? (
          <img src={photo} alt={name} loading="lazy" />
        ) : (
          <div className="wc-couple-photo-empty">{(name || "?").charAt(0)}</div>
        )}
      </div>
      <div className="wc-couple-role">{role}</div>
      <div className="wc-couple-name">{name}</div>
      {intro && <p className="wc-couple-intro">{intro}</p>}
    </article>
  );
}

/* `image` is the photograph the couple uploaded for this chapter, taken
   from media.storyImages by position. The model never writes a URL, so
   chapter.imageUrl only ever holds one on older saved invitations. */
function StoryChapter({ chapter, index, image }) {
  const [ref, vis] = useReveal();
  const photo = image || chapter.imageUrl;
  return (
    <article ref={ref} className={`wc-story-chapter ${vis ? "wc-visible" : ""}`}>
      {photo && (
        <div className="wc-story-image">
          <img src={photo} alt={chapter.title || `Chapter ${index + 1}`} loading="lazy" />
        </div>
      )}
      <div className="wc-story-number">Chapter {String(index + 1).padStart(2, "0")}</div>
      <h3>{chapter.title}</h3>
      <p>{chapter.description}</p>
    </article>
  );
}

/* "Add to calendar" on a timeline card. A Google Calendar template URL
   rather than a downloaded .ics: a phone opens it in the calendar app
   already signed in, and there is no file for the guest to find. Only
   offered when the function actually carries a date — a button that adds
   an event at an unknown time is worse than no button. */
function calendarHref(event, fallbackVenue) {
  const date = String(event?.date || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  const pad = (s, d) => (s || d).padStart(2, "0");
  const [sh, sm] = String(event.time || "").split(":");
  const [eh, em] = String(event.endTime || "").split(":");
  const start = `${date.replace(/-/g, "")}T${pad(sh, "10")}${pad(sm, "00")}00`;
  const endH = eh || String(Math.min(23, Number(pad(sh, "10")) + 2));
  const end = `${date.replace(/-/g, "")}T${pad(endH, "12")}${pad(em, "00")}00`;
  const where = [event.venue, event.address || fallbackVenue].filter(Boolean).join(", ");
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: event.name || "Wedding celebration",
    dates: `${start}/${end}`,
    location: where,
    details: event.description || "",
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

function EventCard({ event, index, total, fallbackVenue }) {
  const [ref, vis] = useReveal();
  const cal = calendarHref(event, fallbackVenue);
  return (
    <article ref={ref} className={`wc-event ${vis ? "wc-visible" : ""}`}>
      <span className="wc-event-dot" aria-hidden="true" />
      <div className="wc-event-image">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.name} loading="lazy" />
        ) : (
          <div className="wc-event-image-empty">{event.name?.charAt(0) || "?"}</div>
        )}
      </div>
      <div className="wc-event-copy">
        <div className="wc-event-number">{String(index + 1).padStart(2, "0")} / {total}</div>
        {event.theme && <p className="wc-event-theme">{event.theme}</p>}
        <h3>{event.name}</h3>
        {event.time && (
          <p className="wc-event-time">
            {event.time}{event.endTime ? ` / ${event.endTime}` : ""}
          </p>
        )}
        {event.venue && <p className="wc-event-venue-name">{event.venue}</p>}
        {event.address && <address className="wc-event-address">{event.address}</address>}
        {event.description && <p className="wc-event-desc">{event.description}</p>}
        {event.dressCode && <p className="wc-event-dress">Dress: {event.dressCode}</p>}
        {cal && (
          <a className="wc-event-cal" href={cal} target="_blank" rel="noreferrer">
            <Calendar size={13} /> Add to calendar
          </a>
        )}
      </div>
    </article>
  );
}

/* The last thing a guest sees: the thank-you, set over a full-width
   photograph of the couple rather than beside a small one. The image is a
   background so the words sit on top of it; without one the monogram
   stands in and nothing looks broken. */
function ClosingFooter({ couple, invitation, media, mono, bride, groom }) {
  const [ref, vis] = useReveal();
  /* Falling back to the opening photograph keeps this scene from being a
     block of flat colour when the couple skipped the last question — it
     is the one picture the invitation is certain to have. */
  const backdrop = media?.closingImage || couple.couplePhoto || media?.heroImageUrl;
  const note = invitation.thankYouNote || invitation.closingMessage;
  return (
    <footer
      ref={ref}
      className={`wc-closing wc-fade ${backdrop ? "wc-closing-hasimage" : ""} ${vis ? "wc-visible" : ""}`}
    >
      {backdrop && (
        <>
          <img className="wc-closing-backdrop" src={backdrop} alt="" aria-hidden="true" />
          <div className="wc-closing-veil" aria-hidden="true" />
        </>
      )}
      <div className="wc-closing-copy">
        {!backdrop && <div className="wc-closing-monogram">{mono}</div>}
        {backdrop && <div className="wc-closing-monogram wc-closing-monogram-over">{mono}</div>}
        {note && <p className="wc-closing-message">{note}</p>}
        {invitation.closingBlessing && <p className="wc-closing-blessing">{invitation.closingBlessing}</p>}
        <h2>
          {bride}
          <em>&amp;</em>
          {groom}
        </h2>
        <small>Wedding Cinema by Welcvm</small>
      </div>
    </footer>
  );
}
