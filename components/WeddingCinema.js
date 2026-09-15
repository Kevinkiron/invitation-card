"use client";

import { Fragment, useEffect, useRef, useState, useMemo, useCallback } from "react";
import { MapPin, Calendar, ChevronDown } from "lucide-react";
import { emptyWeddingTokens } from "@/lib/design/wedding-tokens";

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
          {invitation.displayDate && <div className="wc-hero-date">{invitation.displayDate}</div>}
          <a className="wc-hero-cta" href="#events">
            Begin the story <ChevronDown size={16} />
          </a>
        </div>
        <div className="wc-hero-ornament" aria-hidden="true">{mono}</div>
      </section>

      {/* ── DATE REVEAL ── */}
      {invitation.displayDate && (
        <DateScene dated={dated} />
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
        <section className="wc-scene" id="story">
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
        <section className="wc-scene" id="events">
          <SceneHeading
            eyebrow="The Celebrations"
            title="A wedding told in ceremonies, colour, music and light"
          />
          <div className="wc-timeline">
            <div className="wc-timeline-line" aria-hidden="true" />
            {events.map((ev, i) => (
              <EventCard key={ev.id || i} event={ev} index={i} total={events.length} />
            ))}
          </div>
        </section>
      )}

      {/* ── GALLERY ── */}
      {media.galleryImages?.length > 0 && (
        <section className="wc-scene" id="gallery">
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
        <section className="wc-venue-scene" id="venue">
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
        <section className="wc-scene" id="share">
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

function DateScene({ dated }) {
  const [ref, vis] = useReveal();
  return (
    <section ref={ref} className="wc-scene wc-date-scene">
      <div className="wc-date-halo" aria-hidden="true" />
      <p className="wc-eyebrow" style={{ textAlign: "center" }}>The date is written</p>
      <div className={`wc-date-lockup wc-fade ${vis ? "wc-visible" : ""}`}>
        {dated.day && <b className="wc-date-day">{dated.day}</b>}
        {dated.month && <span className="wc-date-month">{dated.month}</span>}
        {dated.year && <i className="wc-date-year" style={{ fontStyle: "normal" }}>{dated.year}</i>}
      </div>
      <p className="wc-date-hint">Save it in your hearts &amp; calendars</p>
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

function InvitationCard({ couple, invitation, venue, mono, bride, groom, dated }) {
  const [ref, vis] = useReveal();
  const faith = String(invitation.religion || "").trim().toLowerCase();
  const mark = FAITH_MARK[faith] || "✦";
  return (
    <section ref={ref} className="wc-scene" id="families">
      <div className={`wc-inv-card wc-fade ${vis ? "wc-visible" : ""}`}>
        <div className="wc-inv-icon">
          <svg viewBox="0 0 80 80" fill="none" style={{ width: "100%", height: "100%" }} role="presentation">
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth=".5" opacity=".3" />
            <text x="40" y="46" textAnchor="middle" fontSize="28" fill="currentColor" opacity=".6">
              {mark}
            </text>
          </svg>
        </div>
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

        <div className="wc-inv-divider"><i /><b>✦</b><i /></div>

        {invitation.displayDate && (
          <>
            <p className="wc-inv-date-label">Wedding Date</p>
            <p className="wc-inv-date">{invitation.displayDate}</p>
          </>
        )}
        {venue.name && <p className="wc-inv-venue">{venue.name}{venue.city ? `, ${venue.city}` : ""}</p>}
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

function EventCard({ event, index, total }) {
  const [ref, vis] = useReveal();
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
  const backdrop = media?.closingImage || couple.couplePhoto;
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
