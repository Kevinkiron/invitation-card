"use client";

import { Butterfly, LineBloom } from "@/components/invitation/ornaments";
import {
  Countdown, Gallery, RSVPCard, GoldDust, Reveal, MusicToggle,
  formatDayMonth, formatClock, MapLink, formatLong,
} from "@/components/invitation/parts";

/* VELVET HOMECOMING — cinematic luxury editorial.
   Distinct structure: full-bleed Ken Burns hero with the names bottom-left
   (not centred), numbered chapter story beats, asymmetric event rows with
   a hairline rule, and a wide editorial gallery. */
export default function VelvetHomecoming({ data, mode = "gallery" }) {
  const t = { primary: "#5A1224", accent: "#D2AC63", bg: "#120A0D", text: "#F3E7DC" };
  const d = formatDayMonth(data.weddingDate);
  const compact = mode === "gallery";

  return (
    <div
      className="inv-root inv-grain"
      style={{
        "--tpl-primary": t.primary, "--tpl-accent": t.accent,
        "--tpl-bg": t.bg, "--tpl-text": t.text,
        "--tpl-muted": "rgba(243,231,220,.62)",
        "--tpl-heading-font": "'Marcellus', Georgia, serif",
      }}
    >
      {/* ── Hero: full-bleed cinematic ── */}
      <section style={{ position: "relative", height: compact ? 430 : 500, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
        <div className="inv-art inv-kenburns" data-art="ember" style={{ position: "absolute", inset: -20 }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, rgba(18,10,13,.5) 0%, rgba(18,10,13,.15) 38%, rgba(18,10,13,.92) 100%)` }} />
        <GoldDust count={18} color={t.accent} duration={13} />

        <span style={{ position: "absolute", top: "22%", right: "12%", animation: "invFloat 7s ease-in-out infinite" }}>
          <Butterfly color={t.accent} size={24} />
        </span>
        <span style={{ position: "absolute", top: "40%", left: "10%", animation: "invFloat 9s ease-in-out 1.4s infinite" }}>
          <Butterfly color={t.accent} size={16} opacity={0.6} />
        </span>

        <div style={{ position: "relative", padding: "0 22px 30px" }}>
          <div className="inv-eyebrow inv-fadeDown" style={{ color: t.accent, marginBottom: 14 }}>
            {data.guestName ? `Dear ${data.guestName}` : "The wedding of"}
          </div>
          <h1 className="inv-fadeUp" style={{ fontSize: compact ? 42 : 50, lineHeight: 0.98, letterSpacing: "-.01em" }}>
            {data.groom.name}
          </h1>
          <div className="inv-fadeIn" style={{ fontSize: 15, color: t.accent, margin: "4px 0 2px", fontStyle: "italic", fontFamily: "var(--tpl-heading-font)" }}>and</div>
          <h1 className="inv-fadeUp" style={{ fontSize: compact ? 42 : 50, lineHeight: 0.98, letterSpacing: "-.01em", animationDelay: ".1s" }}>
            {data.bride.name}
          </h1>

          <div className="inv-fadeIn" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20, animationDelay: ".3s" }}>
            <span style={{ height: 1, flex: 1, background: `${t.accent}66` }} />
            <span style={{ fontSize: 10.5, letterSpacing: ".26em", color: t.accent }}>{d.day}.{d.month}.{d.year}</span>
            <span style={{ height: 1, flex: 1, background: `${t.accent}66` }} />
          </div>
        </div>
      </section>

      {/* ── Countdown strip ── */}
      <Reveal as="section" style={{ padding: "24px 22px", background: t.primary }}>
        <Countdown
          date={data.weddingDate}
          cellStyle={{ borderRight: `1px solid ${t.accent}3d` }}
          numStyle={{ color: t.accent }}
          labelStyle={{ color: "rgba(243,231,220,.7)" }}
        />
      </Reveal>

      {/* ── Intro ── */}
      <Reveal as="section" className="inv-sec" style={{ textAlign: "center" }}>
        <LineBloom color={t.accent} size={54} opacity={0.5} />
        <p style={{ fontSize: 14, lineHeight: 1.85, fontStyle: "italic", fontFamily: "var(--tpl-heading-font)", margin: "14px 0 0" }}>
          {data.intro}
        </p>
        <div style={{ marginTop: 18 }}>
          <MusicToggle accent={t.accent} title={data.music.title} onDark />
        </div>
      </Reveal>

      {/* ── Chapters ── */}
      <section className="inv-sec" style={{ paddingTop: 10 }}>
        <Reveal style={{ marginBottom: 24 }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>Our story</div>
          <h2 style={{ fontSize: 27, lineHeight: 1.14 }}>{data.story.title}</h2>
        </Reveal>

        {data.story.timeline.map((s, i) => (
          <Reveal key={s.year} delay={i * 80}>
            <article style={{ marginBottom: 24, paddingBottom: 24, borderBottom: i < data.story.timeline.length - 1 ? `1px solid ${t.accent}26` : "none" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                <span style={{ fontFamily: "var(--tpl-heading-font)", fontSize: 34, color: `${t.accent}59`, lineHeight: 1 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div style={{ fontSize: 9.5, letterSpacing: ".22em", color: t.accent, textTransform: "uppercase" }}>Chapter {s.year}</div>
                  <h3 style={{ fontSize: 19, marginTop: 4 }}>{s.title}</h3>
                </div>
              </div>
              <p style={{ fontSize: 12.5, lineHeight: 1.85, color: "var(--tpl-muted)", paddingLeft: 46 }}>{s.text}</p>
            </article>
          </Reveal>
        ))}
      </section>

      {/* ── Events: asymmetric editorial rows ── */}
      <section className="inv-sec" style={{ background: "rgba(255,255,255,.03)" }}>
        <Reveal style={{ marginBottom: 20 }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>The schedule</div>
          <h2 style={{ fontSize: 26 }}>Four acts</h2>
        </Reveal>

        {data.events.map((ev, i) => {
          const ed = formatDayMonth(ev.date);
          return (
            <Reveal key={ev.name} delay={i * 70}>
              <div style={{ display: "flex", gap: 14, padding: "16px 0", borderTop: `1px solid ${t.accent}26` }}>
                <div style={{ flexShrink: 0, width: 52, textAlign: "center" }}>
                  <div style={{ fontFamily: "var(--tpl-heading-font)", fontSize: 26, color: t.accent, lineHeight: 1 }}>{ed.day}</div>
                  <div style={{ fontSize: 8.5, letterSpacing: ".18em", color: "var(--tpl-muted)", marginTop: 3 }}>{ed.month}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 17, marginBottom: 5 }}>{ev.name}</h3>
                  <div style={{ fontSize: 10.5, letterSpacing: ".1em", color: t.accent, marginBottom: 5 }}>{formatClock(ev.time)}</div>
                  <div style={{ fontSize: 11.5, color: "var(--tpl-muted)", lineHeight: 1.6 }}>{ev.venue}</div>
                  <div style={{ fontSize: 10.5, color: "var(--tpl-muted)", opacity: 0.7 }}>{ev.address}</div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </section>

      {/* ── Gallery ── */}
      <section className="inv-sec">
        <Reveal style={{ marginBottom: 16 }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>The album</div>
          <h2 style={{ fontSize: 26 }}>Frames from the story</h2>
        </Reveal>
        <Reveal><Gallery items={data.gallery} accent={t.accent} radius={1} /></Reveal>
      </section>

      {/* ── Venue ── */}
      <Reveal as="section" style={{ position: "relative", padding: "40px 22px", overflow: "hidden" }}>
        <div className="inv-art" data-art="noir" style={{ position: "absolute", inset: 0, opacity: 0.55 }} />
        <div style={{ position: "relative" }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 10 }}>The venue</div>
          <h2 style={{ fontSize: 26, marginBottom: 10 }}>{data.venue.name}</h2>
          <p style={{ fontSize: 12.5, lineHeight: 1.75, color: "var(--tpl-muted)", marginBottom: 4 }}>{data.venue.address}</p>
          <p style={{ fontSize: 11, lineHeight: 1.7, color: "var(--tpl-muted)", opacity: 0.75, marginBottom: 18 }}>{data.venue.directions}</p>
          <MapLink query={data.venue.mapQuery} accent={t.accent} />
        </div>
      </Reveal>

      {/* ── Dress code ── */}
      <Reveal as="section" className="inv-sec-tight" style={{ textAlign: "center", borderTop: `1px solid ${t.accent}26`, borderBottom: `1px solid ${t.accent}26` }}>
        <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>Dress code</div>
        <div style={{ fontSize: 16, fontFamily: "var(--tpl-heading-font)", marginBottom: 6 }}>{data.dressCode.title}</div>
        <p style={{ fontSize: 11.5, color: "var(--tpl-muted)", lineHeight: 1.7 }}>{data.dressCode.note}</p>
      </Reveal>

      {/* ── RSVP ── */}
      <section className="inv-sec">
        <Reveal style={{ marginBottom: 16 }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>Répondez</div>
          <h2 style={{ fontSize: 26 }}>{data.rsvp.question}</h2>
        </Reveal>
        <Reveal>
          <RSVPCard accent={t.accent} onDark question="We would be honoured to have you there." deadline={data.rsvp.deadline} events={data.events} />
        </Reveal>
      </section>

      <footer style={{ textAlign: "center", padding: "34px 22px 42px", borderTop: `1px solid ${t.accent}26` }}>
        <LineBloom color={t.accent} size={44} opacity={0.45} />
        <h2 style={{ fontSize: 24, marginTop: 12 }}>{data.groom.name} &amp; {data.bride.name}</h2>
        <div style={{ fontSize: 10, letterSpacing: ".22em", color: t.accent, marginTop: 8, textTransform: "uppercase" }}>
          {formatLong(data.weddingDate)}
        </div>
        <div style={{ fontSize: 10, color: "var(--tpl-muted)", marginTop: 10, letterSpacing: ".1em" }}>{data.hashtag}</div>
      </footer>
    </div>
  );
}
