"use client";

import { Wash, Sprig } from "@/components/invitation/ornaments";
import {
  Countdown, Gallery, RSVPCard, Petals, Reveal,
  formatDayMonth, formatClock, MapLink, formatLong,
} from "@/components/invitation/parts";

/* AZURE WATERCOLOUR — soft, painted, editorial.
   Distinct structure: overlapping watercolour washes bleeding off both
   edges, a two-column left-rail timeline (date column / content column),
   and a frosted-glass RSVP card floating over a wash. */
export default function AzureWatercolour({ data, mode = "gallery" }) {
  const t = { primary: "#3C6088", accent: "#C4A05C", bg: "#F4F7FA", text: "#25313D" };
  const d = formatDayMonth(data.weddingDate);
  const compact = mode === "gallery";

  return (
    <div
      className="inv-root inv-paper"
      style={{
        "--tpl-primary": t.primary, "--tpl-accent": t.accent,
        "--tpl-bg": t.bg, "--tpl-text": t.text,
        "--tpl-heading-font": "'Marcellus', Georgia, serif",
      }}
    >
      {/* ── Hero ── */}
      <section style={{ position: "relative", padding: "40px 22px 34px", textAlign: "center", overflow: "hidden" }}>
        <span style={{ position: "absolute", top: -46, left: -58, pointerEvents: "none" }}>
          <Wash color="#8FB4D6" size={190} opacity={0.5} seed={0} />
        </span>
        <span style={{ position: "absolute", top: 30, right: -66, pointerEvents: "none" }}>
          <Wash color="#B7CFE4" size={168} opacity={0.45} seed={1} />
        </span>
        <span style={{ position: "absolute", bottom: -60, left: 10, pointerEvents: "none" }}>
          <Wash color="#D9C79A" size={150} opacity={0.32} seed={2} />
        </span>
        <Petals count={9} colors={["#BFD6EA", "#E4EDF4", "#D9C79A"]} duration={17} />

        <div style={{ position: "relative" }}>
          <div className="inv-eyebrow" style={{ color: t.primary, marginBottom: 16, opacity: 0.7 }}>
            {data.guestName ? `Dear ${data.guestName}` : "Save the date"}
          </div>

          <h1 className="inv-fadeUp" style={{ fontSize: compact ? 33 : 40, color: t.primary, lineHeight: 1.1 }}>
            {data.groom.name}
          </h1>
          <div style={{ fontSize: 20, color: t.accent, margin: "6px 0", fontFamily: "var(--tpl-heading-font)", fontStyle: "italic" }}>&amp;</div>
          <h1 className="inv-fadeUp" style={{ fontSize: compact ? 33 : 40, color: t.primary, lineHeight: 1.1, animationDelay: ".1s" }}>
            {data.bride.name}
          </h1>

          <div style={{ marginTop: 20, display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 22px", borderTop: `1px solid ${t.accent}66`, borderBottom: `1px solid ${t.accent}66` }}>
            <span style={{ fontSize: 9.5, letterSpacing: ".26em", textTransform: "uppercase", color: t.accent }}>{d.weekday}</span>
            <span style={{ fontFamily: "var(--tpl-heading-font)", fontSize: 26, color: t.primary, lineHeight: 1 }}>{d.day} {d.month}</span>
            <span style={{ fontSize: 9.5, letterSpacing: ".26em", color: t.primary, opacity: 0.6 }}>{d.year}</span>
          </div>

          <p style={{ fontSize: 12, lineHeight: 1.8, opacity: 0.72, marginTop: 20, fontStyle: "italic" }}>{data.blessing}</p>
        </div>
      </section>

      {/* ── Countdown ── */}
      <Reveal as="section" className="inv-sec-tight" style={{ textAlign: "center" }}>
        <Countdown
          date={data.weddingDate}
          cellStyle={{ background: "rgba(255,255,255,.72)", border: `1px solid ${t.primary}1f`, borderRadius: 6, backdropFilter: "blur(6px)" }}
          numStyle={{ color: t.primary }}
          labelStyle={{ color: t.primary, opacity: 0.55 }}
        />
      </Reveal>

      {/* ── Story ── */}
      <section className="inv-sec" style={{ position: "relative", overflow: "hidden" }}>
        <span style={{ position: "absolute", top: 20, right: -70, pointerEvents: "none" }}>
          <Wash color="#A9C6DE" size={160} opacity={0.3} seed={1} />
        </span>
        <Reveal style={{ position: "relative", textAlign: "center", marginBottom: 18 }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>Our story</div>
          <h2 style={{ fontSize: 23, color: t.primary, marginBottom: 12 }}>{data.story.title}</h2>
          <p style={{ fontSize: 12, lineHeight: 1.85, opacity: 0.74 }}>{data.story.body}</p>
        </Reveal>
      </section>

      {/* ── Two-column editorial timeline ── */}
      <section className="inv-sec" style={{ background: "rgba(255,255,255,.6)" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>The days</div>
          <h2 style={{ fontSize: 23, color: t.primary }}>Where to be, and when</h2>
        </Reveal>

        {data.events.map((ev, i) => {
          const ed = formatDayMonth(ev.date);
          return (
            <Reveal key={ev.name} delay={i * 70}>
              <div style={{ display: "grid", gridTemplateColumns: "58px 1fr", gap: 14, padding: "14px 0", borderBottom: `1px solid ${t.primary}14` }}>
                <div style={{ textAlign: "right", borderRight: `1px solid ${t.accent}59`, paddingRight: 12 }}>
                  <div style={{ fontFamily: "var(--tpl-heading-font)", fontSize: 22, color: t.primary, lineHeight: 1 }}>{ed.day}</div>
                  <div style={{ fontSize: 8.5, letterSpacing: ".16em", color: t.accent, marginTop: 4 }}>{ed.month}</div>
                  <div style={{ fontSize: 8.5, color: t.primary, opacity: 0.5, marginTop: 6 }}>{formatClock(ev.time)}</div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ fontSize: 16, color: t.primary, marginBottom: 4 }}>{ev.name}</h3>
                  <div style={{ fontSize: 11.5, opacity: 0.75 }}>{ev.venue}</div>
                  <div style={{ fontSize: 10.5, opacity: 0.55 }}>{ev.address}</div>
                  {ev.note && <p style={{ fontSize: 10.5, opacity: 0.55, fontStyle: "italic", marginTop: 5 }}>{ev.note}</p>}
                </div>
              </div>
            </Reveal>
          );
        })}
      </section>

      {/* ── Gallery ── */}
      <section className="inv-sec">
        <Reveal style={{ textAlign: "center", marginBottom: 14 }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>Moments</div>
          <h2 style={{ fontSize: 22, color: t.primary }}>A few of our favourites</h2>
        </Reveal>
        <Reveal><Gallery items={data.gallery} accent={t.accent} radius={6} /></Reveal>
      </section>

      {/* ── Venue ── */}
      <Reveal as="section" className="inv-sec" style={{ textAlign: "center", position: "relative", overflow: "hidden" }}>
        <span style={{ position: "absolute", bottom: -70, left: -50, pointerEvents: "none" }}>
          <Wash color="#8FB4D6" size={180} opacity={0.34} seed={0} />
        </span>
        <div style={{ position: "relative" }}>
          <Sprig color={t.accent} size={40} />
          <div className="inv-eyebrow" style={{ color: t.accent, margin: "10px 0" }}>The venue</div>
          <h2 style={{ fontSize: 23, color: t.primary, marginBottom: 8 }}>{data.venue.name}</h2>
          <p style={{ fontSize: 12, opacity: 0.74, lineHeight: 1.7 }}>{data.venue.address}</p>
          <p style={{ fontSize: 11, opacity: 0.55, marginTop: 4, marginBottom: 16 }}>{data.venue.directions}</p>
          <MapLink query={data.venue.mapQuery} accent={t.primary} />
        </div>
      </Reveal>

      {/* ── Frosted-glass RSVP ── */}
      <section className="inv-sec" style={{ position: "relative", overflow: "hidden" }}>
        <span style={{ position: "absolute", top: -30, right: -60, pointerEvents: "none" }}>
          <Wash color="#B7CFE4" size={180} opacity={0.42} seed={2} />
        </span>
        <div style={{ position: "relative" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 16 }}>
            <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>Kindly reply</div>
            <h2 style={{ fontSize: 22, color: t.primary }}>{data.rsvp.question}</h2>
          </Reveal>
          <Reveal>
            <div style={{ background: "rgba(255,255,255,.55)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderRadius: 10, padding: 4, border: "1px solid rgba(255,255,255,.7)", boxShadow: "0 18px 40px -22px rgba(37,49,61,.5)" }}>
              <RSVPCard accent={t.accent} question="We would love to have you with us." deadline={data.rsvp.deadline} events={data.events} />
            </div>
          </Reveal>
        </div>
      </section>

      <footer style={{ textAlign: "center", padding: "28px 22px 40px", position: "relative", overflow: "hidden" }}>
        <span style={{ position: "absolute", bottom: -80, right: -60, pointerEvents: "none" }}>
          <Wash color="#D9C79A" size={170} opacity={0.28} seed={1} />
        </span>
        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: 22, color: t.primary }}>{data.groom.name} &amp; {data.bride.name}</h2>
          <div style={{ fontSize: 9.5, letterSpacing: ".2em", textTransform: "uppercase", color: t.accent, marginTop: 8 }}>
            {formatLong(data.weddingDate)}
          </div>
          <div style={{ fontSize: 10, opacity: 0.5, marginTop: 10 }}>{data.hashtag}</div>
        </div>
      </footer>
    </div>
  );
}
