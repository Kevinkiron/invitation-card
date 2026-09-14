"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
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

/* ── Word-by-word reveal component ── */
function WordReveal({ text, visible, delay = 0 }) {
  const words = (text || "").split(" ");
  return words.map((word, i) => (
    <span
      key={i}
      className={`wc-word ${visible ? "wc-revealed" : ""}`}
      style={{ transitionDelay: `${delay + i * 80}ms` }}
    >
      {word}{" "}
    </span>
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
              <StoryChapter key={ch.id || i} chapter={ch} index={i} />
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
          {venue.mapQuery && (
            <a className="wc-venue-cta" href={`https://maps.google.com/?q=${encodeURIComponent(venue.mapQuery)}`} target="_blank" rel="noreferrer">
              <MapPin size={16} /> Open in Maps
            </a>
          )}
        </section>
      )}

      {/* ── SOCIAL / HASHTAG ── */}
      {social.hashtag && (
        <section className="wc-scene">
          <SceneHeading eyebrow="Share the Moment" title="Share the celebration with us" />
          <div className="wc-hashtag">#{social.hashtag}</div>
          <p style={{ textAlign: "center", fontSize: 14, color: "var(--wc-muted)" }}>
            Share your favourite moments and tag the couple after the celebration.
          </p>
        </section>
      )}

      {/* ── CLOSING ── */}
      <ClosingFooter
        couple={couple}
        invitation={invitation}
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

function InvitationCard({ couple, invitation, venue, mono, bride, groom, dated }) {
  const [ref, vis] = useReveal();
  return (
    <section ref={ref} className="wc-scene" id="families">
      <div className={`wc-inv-card wc-fade ${vis ? "wc-visible" : ""}`}>
        {/* Ganesh ji or ornament icon */}
        <div className="wc-inv-icon">
          <svg viewBox="0 0 80 80" fill="none" style={{ width: "100%", height: "100%" }}>
            <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth=".5" opacity=".3" />
            <text x="40" y="46" textAnchor="middle" fontFamily="'Great Vibes', cursive" fontSize="28" fill="currentColor" opacity=".6">
              ॐ
            </text>
          </svg>
        </div>

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

function StoryChapter({ chapter, index }) {
  const [ref, vis] = useReveal();
  return (
    <article ref={ref} className={`wc-story-chapter ${vis ? "wc-visible" : ""}`}>
      {chapter.imageUrl && (
        <div className="wc-story-image">
          <img src={chapter.imageUrl} alt={chapter.title} loading="lazy" />
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

function ClosingFooter({ couple, invitation, mono, bride, groom }) {
  const [ref, vis] = useReveal();
  return (
    <footer ref={ref} className={`wc-closing wc-fade ${vis ? "wc-visible" : ""}`}>
      {couple.couplePhoto ? (
        <div className="wc-closing-image">
          <img src={couple.couplePhoto} alt={`${bride} & ${groom}`} />
        </div>
      ) : (
        <div className="wc-closing-monogram">{mono}</div>
      )}
      {invitation.closingMessage && <p className="wc-closing-message">{invitation.closingMessage}</p>}
      {invitation.closingBlessing && <p className="wc-closing-blessing">{invitation.closingBlessing}</p>}
      <h2>
        {bride}
        <em>&amp;</em>
        {groom}
      </h2>
      <small>Wedding Cinema by Welcvm</small>
    </footer>
  );
}
