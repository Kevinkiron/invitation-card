"use client";

import { LineBloom } from "@/components/invitation/ornaments";
import {
  Countdown, Gallery, RSVPCard, GoldDust, Reveal, InvNav, MusicToggle,
  formatDayMonth, formatClock, MapLink, formatLong,
} from "@/components/invitation/parts";

/* MIDNIGHT ROMANCE — dark modern minimal.
   Distinct structure: a full-bleed portrait hero with the names centred
   and overlapping the image, an oversized single-number countdown, a
   two-up event grid (not a list), and generous negative space. */
export default function MidnightRomance({ data, mode = "gallery" }) {
  const t = { primary: "#100F14", accent: "#CBA96A", bg: "#0B0A0E", text: "#EDE6DC" };
  const d = formatDayMonth(data.weddingDate);
  const compact = mode === "gallery";

  return (
    <div
      className="inv-root inv-grain"
      style={{
        "--tpl-primary": t.primary, "--tpl-accent": t.accent,
        "--tpl-bg": t.bg, "--tpl-text": t.text,
        "--tpl-muted": "rgba(237,230,220,.6)",
        "--tpl-heading-font": "'Marcellus', Georgia, serif",
      }}
    >
      <InvNav
        background="rgba(11,10,14,.82)"
        color={t.text}
        accent={t.accent}
        sections={[
          { id: "mr-home", label: "Home" },
          { id: "mr-story", label: "Story" },
          { id: "mr-events", label: "Events" },
          { id: "mr-gallery", label: "Gallery" },
          { id: "mr-rsvp", label: "RSVP" },
        ]}
      />

      {/* ── Hero ── */}
      <section id="mr-home" style={{ position: "relative", height: compact ? 400 : 470, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="inv-art inv-kenburns" data-art="noir" style={{ position: "absolute", inset: -16 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,10,14,.72) 0%, rgba(11,10,14,.35) 45%, rgba(11,10,14,.95) 100%)" }} />
        <GoldDust count={20} color={t.accent} duration={14} />

        <span style={{ position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)", opacity: 0.4 }}>
          <LineBloom color={t.accent} size={80} opacity={0.5} />
        </span>

        <div style={{ position: "relative", textAlign: "center", padding: "0 22px" }}>
          <div className="inv-eyebrow inv-fadeDown" style={{ color: t.accent, marginBottom: 18 }}>
            {data.guestName ? `Dear ${data.guestName}` : "Save the date"}
          </div>
          <h1 className="inv-foil inv-fadeUp" style={{ fontSize: compact ? 36 : 44, lineHeight: 1.02, letterSpacing: "-.005em" }}>
            {data.groom.name}
          </h1>
          <div className="inv-fadeIn" style={{ fontSize: 15, color: t.accent, margin: "8px 0", fontFamily: "var(--tpl-heading-font)", fontStyle: "italic" }}>&amp;</div>
          <h1 className="inv-foil inv-fadeUp" style={{ fontSize: compact ? 36 : 44, lineHeight: 1.02, letterSpacing: "-.005em", animationDelay: ".1s" }}>
            {data.bride.name}
          </h1>
          <div className="inv-fadeIn" style={{ marginTop: 22, fontSize: 10, letterSpacing: ".34em", textTransform: "uppercase", color: "var(--tpl-muted)", animationDelay: ".3s" }}>
            {d.day} · {d.month} · {d.year}
          </div>
        </div>
      </section>

      {/* ── Oversized day counter ── */}
      <Reveal as="section" className="inv-sec" style={{ textAlign: "center", borderBottom: `1px solid ${t.accent}1f` }}>
        <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 18 }}>The countdown</div>
        <Countdown
          date={data.weddingDate}
          cellStyle={{ borderRight: `1px solid ${t.accent}26` }}
          numStyle={{ color: t.accent, fontSize: 26 }}
          labelStyle={{ color: "var(--tpl-muted)" }}
        />
        <div style={{ marginTop: 20 }}>
          <MusicToggle accent={t.accent} title={data.music.title} onDark />
        </div>
      </Reveal>

      {/* ── Story ── */}
      <section id="mr-story" className="inv-sec">
        <Reveal style={{ marginBottom: 20, textAlign: "center" }}>
          <LineBloom color={t.accent} size={40} opacity={0.5} />
          <div className="inv-eyebrow" style={{ color: t.accent, margin: "12px 0 10px" }}>Our story</div>
          <h2 style={{ fontSize: 25, lineHeight: 1.16, marginBottom: 12 }}>{data.story.title}</h2>
          <p style={{ fontSize: 12.5, lineHeight: 1.9, color: "var(--tpl-muted)" }}>{data.story.body}</p>
        </Reveal>

        {data.story.timeline.map((s, i) => (
          <Reveal key={s.year} delay={i * 70}>
            <div style={{ textAlign: "center", padding: "16px 0", borderTop: `1px solid ${t.accent}1a` }}>
              <div style={{ fontSize: 9.5, letterSpacing: ".26em", color: t.accent, marginBottom: 6 }}>{s.year}</div>
              <h3 style={{ fontSize: 17, marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 11.5, lineHeight: 1.75, color: "var(--tpl-muted)" }}>{s.text}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── Events as a two-up grid ── */}
      <section id="mr-events" className="inv-sec" style={{ background: "rgba(255,255,255,.028)" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 20 }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>The itinerary</div>
          <h2 style={{ fontSize: 25 }}>Where to find us</h2>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {data.events.map((ev, i) => {
            const ed = formatDayMonth(ev.date);
            return (
              <Reveal key={ev.name} delay={i * 60}>
                <div style={{ border: `1px solid ${t.accent}2e`, padding: "14px 11px", height: "100%", textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--tpl-heading-font)", fontSize: 21, color: t.accent, lineHeight: 1 }}>{ed.day}</div>
                  <div style={{ fontSize: 8, letterSpacing: ".2em", color: "var(--tpl-muted)", margin: "5px 0 9px" }}>{ed.month}</div>
                  <h3 style={{ fontSize: 13.5, marginBottom: 6, lineHeight: 1.25 }}>{ev.name}</h3>
                  <div style={{ fontSize: 9.5, color: t.accent, letterSpacing: ".08em", marginBottom: 5 }}>{formatClock(ev.time)}</div>
                  <div style={{ fontSize: 10, color: "var(--tpl-muted)", lineHeight: 1.5 }}>{ev.venue}</div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Gallery ── */}
      <section id="mr-gallery" className="inv-sec">
        <Reveal style={{ textAlign: "center", marginBottom: 16 }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>The album</div>
          <h2 style={{ fontSize: 24 }}>In pictures</h2>
        </Reveal>
        <Reveal><Gallery items={data.gallery} accent={t.accent} radius={0} /></Reveal>
      </section>

      {/* ── Venue ── */}
      <Reveal as="section" className="inv-sec" style={{ textAlign: "center", borderTop: `1px solid ${t.accent}1f` }}>
        <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 10 }}>The venue</div>
        <h2 style={{ fontSize: 24, marginBottom: 10 }}>{data.venue.name}</h2>
        <p style={{ fontSize: 12, color: "var(--tpl-muted)", lineHeight: 1.7 }}>{data.venue.address}</p>
        <p style={{ fontSize: 11, color: "var(--tpl-muted)", opacity: 0.7, marginTop: 4, marginBottom: 18 }}>{data.venue.directions}</p>
        <MapLink query={data.venue.mapQuery} accent={t.accent} />

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${t.accent}1a` }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>Dress code</div>
          <div style={{ fontSize: 15, fontFamily: "var(--tpl-heading-font)", marginBottom: 5 }}>{data.dressCode.title}</div>
          <p style={{ fontSize: 11, color: "var(--tpl-muted)", lineHeight: 1.65 }}>{data.dressCode.note}</p>
        </div>
      </Reveal>

      {/* ── RSVP ── */}
      <section id="mr-rsvp" className="inv-sec">
        <Reveal style={{ textAlign: "center", marginBottom: 16 }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>RSVP</div>
          <h2 style={{ fontSize: 24 }}>{data.rsvp.question}</h2>
        </Reveal>
        <Reveal>
          <RSVPCard accent={t.accent} onDark question="Two words, and we'll save you a seat." deadline={data.rsvp.deadline} events={data.events} />
        </Reveal>
      </section>

      <footer style={{ textAlign: "center", padding: "32px 22px 42px", borderTop: `1px solid ${t.accent}1f` }}>
        <LineBloom color={t.accent} size={40} opacity={0.45} />
        <h2 className="inv-foil" style={{ fontSize: 23, marginTop: 12 }}>
          {data.groom.name} &amp; {data.bride.name}
        </h2>
        <div style={{ fontSize: 9.5, letterSpacing: ".24em", textTransform: "uppercase", color: "var(--tpl-muted)", marginTop: 9 }}>
          {formatLong(data.weddingDate)}
        </div>
        <div style={{ fontSize: 10, color: t.accent, marginTop: 10, letterSpacing: ".1em" }}>{data.hashtag}</div>
      </footer>
    </div>
  );
}
