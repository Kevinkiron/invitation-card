"use client";

import { ArchFrame, CornerFlourish, Medallion, Sprig } from "@/components/invitation/ornaments";
import {
  Countdown, Gallery, RSVPCard, InvNav, GoldDust, Reveal,
  formatLong, formatDayMonth, formatClock, MapLink,
} from "@/components/invitation/parts";

/* CEYLON HERITAGE — formal, symmetric, arch-framed.
   Distinct structure: a tall arched hero frame, a circular date
   medallion, centre-aligned everything, and a wishes wall. */
export default function CeylonHeritage({ data, mode = "gallery" }) {
  const t = { primary: "#5B1226", accent: "#C1994A", bg: "#FBF4E7", text: "#2C1E1A" };
  const d = formatDayMonth(data.weddingDate);
  const compact = mode === "gallery";

  return (
    <div
      className="inv-root inv-paper"
      style={{
        "--tpl-primary": t.primary, "--tpl-accent": t.accent,
        "--tpl-bg": t.bg, "--tpl-text": t.text,
        "--tpl-heading-font": "'Marcellus', Georgia, serif",
        "--tpl-script-font": "'Marcellus', Georgia, serif",
      }}
    >
      <InvNav
        background="rgba(251,244,231,.9)"
        color={t.primary}
        accent={t.accent}
        sections={[
          { id: "ch-home", label: "Home" },
          { id: "ch-story", label: "Story" },
          { id: "ch-events", label: "Events" },
          { id: "ch-gallery", label: "Photos" },
          { id: "ch-rsvp", label: "RSVP" },
        ]}
      />

      {/* ── Hero: arched frame ── */}
      <section id="ch-home" style={{ position: "relative", padding: "26px 20px 34px", textAlign: "center", overflow: "hidden" }}>
        <GoldDust count={14} color={t.accent} />
        <div style={{ position: "absolute", top: 8, left: 6 }}><CornerFlourish color={t.accent} size={58} /></div>
        <div style={{ position: "absolute", top: 8, right: 6 }}><CornerFlourish color={t.accent} size={58} flipX /></div>

        <div style={{ position: "relative", padding: "30px 16px 22px" }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <ArchFrame color={t.accent} height="100%" />
          </div>

          <div style={{ position: "relative" }}>
            <div className="inv-eyebrow inv-fadeDown" style={{ color: t.primary, marginBottom: 16 }}>
              {data.guestName ? `Dear ${data.guestName}` : "Together with our families"}
            </div>

            <div className="inv-script inv-fadeUp" style={{ fontSize: compact ? 34 : 40, color: t.primary, lineHeight: 1.06 }}>
              {data.groom.name}
            </div>
            <div className="inv-fadeIn" style={{ fontSize: 13, color: t.accent, margin: "7px 0", letterSpacing: ".28em" }}>&</div>
            <div className="inv-script inv-fadeUp" style={{ fontSize: compact ? 34 : 40, color: t.primary, lineHeight: 1.06, animationDelay: ".12s" }}>
              {data.bride.name}
            </div>

            <div className="inv-rule inv-fadeIn" style={{ color: t.accent, margin: "18px 0" }}>
              <span style={{ fontSize: 11 }}>❖</span>
            </div>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
              <Medallion color={t.accent} size={compact ? 96 : 110}>
                <span style={{ display: "block", fontSize: 8.5, letterSpacing: ".22em", color: t.accent, textTransform: "uppercase" }}>{d.weekday}</span>
                <span className="inv-script" style={{ display: "block", fontSize: 30, color: t.primary, lineHeight: 1.1, margin: "2px 0" }}>{d.day}</span>
                <span style={{ display: "block", fontSize: 8.5, letterSpacing: ".22em", color: t.accent, textTransform: "uppercase" }}>{d.month} {d.year}</span>
              </Medallion>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 11.5, color: t.primary, opacity: 0.75, fontStyle: "italic", lineHeight: 1.7, maxWidth: 250, margin: "20px auto 0" }}>
          {data.blessing}
        </p>
      </section>

      {/* ── Blessing band ── */}
      <Reveal as="section" className="inv-sec-tight" style={{ background: t.primary, color: t.bg, textAlign: "center" }}>
        <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 10 }}>An invitation</div>
        <p style={{ fontSize: 12.5, lineHeight: 1.8, opacity: 0.92 }}>{data.intro}</p>
        <div style={{ marginTop: 14, fontSize: 10.5, letterSpacing: ".1em", opacity: 0.7 }}>{data.hashtag}</div>
      </Reveal>

      {/* ── Countdown ── */}
      <section className="inv-sec" style={{ textAlign: "center" }}>
        <Reveal>
          <div className="inv-eyebrow" style={{ color: t.primary, marginBottom: 16 }}>Counting the days</div>
          <Countdown
            date={data.weddingDate}
            cellStyle={{ border: `1px solid ${t.accent}55`, background: "rgba(255,255,255,.5)" }}
            numStyle={{ color: t.primary }}
            labelStyle={{ color: t.accent }}
          />
        </Reveal>
      </section>

      {/* ── Parents ── */}
      <Reveal as="section" className="inv-sec-tight" style={{ textAlign: "center", borderTop: `1px solid ${t.accent}33`, borderBottom: `1px solid ${t.accent}33` }}>
        <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: t.accent, marginBottom: 5 }}>Son of</div>
            <div style={{ fontSize: 11, lineHeight: 1.5, color: t.primary }}>{data.groom.parents}</div>
          </div>
          <Sprig color={t.accent} size={44} />
          <div>
            <div style={{ fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: t.accent, marginBottom: 5 }}>Daughter of</div>
            <div style={{ fontSize: 11, lineHeight: 1.5, color: t.primary }}>{data.bride.parents}</div>
          </div>
        </div>
      </Reveal>

      {/* ── Story ── */}
      <section id="ch-story" className="inv-sec" style={{ textAlign: "center" }}>
        <Reveal>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 10 }}>Our story</div>
          <h2 style={{ fontSize: 24, color: t.primary, marginBottom: 12 }}>{data.story.title}</h2>
          <p style={{ fontSize: 12, lineHeight: 1.85, opacity: 0.8, marginBottom: 22 }}>{data.story.body}</p>
        </Reveal>
        {data.story.timeline.map((s, i) => (
          <Reveal key={s.year} delay={i * 70}>
            <div style={{ display: "flex", gap: 14, textAlign: "left", paddingBottom: 18 }}>
              <div style={{ flexShrink: 0, width: 44, textAlign: "right" }}>
                <div className="inv-script" style={{ fontSize: 16, color: t.accent }}>{s.year}</div>
              </div>
              <div style={{ flexShrink: 0, width: 1, background: `${t.accent}55`, position: "relative" }}>
                <span style={{ position: "absolute", top: 5, left: -3, width: 7, height: 7, borderRadius: "50%", background: t.bg, border: `1.4px solid ${t.accent}` }} />
              </div>
              <div>
                <div style={{ fontSize: 13, color: t.primary, fontFamily: "var(--tpl-heading-font)", marginBottom: 4 }}>{s.title}</div>
                <p style={{ fontSize: 11.5, lineHeight: 1.7, opacity: 0.72 }}>{s.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── Events ── */}
      <section id="ch-events" className="inv-sec" style={{ background: `${t.accent}14`, textAlign: "center" }}>
        <Reveal>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 6 }}>The celebrations</div>
          <h2 style={{ fontSize: 23, color: t.primary, marginBottom: 22 }}>Four days of joy</h2>
        </Reveal>
        {data.events.map((ev, i) => {
          const ed = formatDayMonth(ev.date);
          return (
            <Reveal key={ev.name} delay={i * 70}>
              <div style={{ border: `1px solid ${t.accent}44`, borderRadius: 3, padding: "16px 14px", marginBottom: 10, background: "rgba(255,255,255,.5)", position: "relative" }}>
                <span style={{ position: "absolute", top: 6, left: 6 }}><CornerFlourish color={t.accent} size={20} /></span>
                <span style={{ position: "absolute", bottom: 6, right: 6 }}><CornerFlourish color={t.accent} size={20} flipX flipY /></span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginBottom: 8 }}>
                  <span style={{ height: 1, width: 16, background: t.accent, opacity: 0.6 }} />
                  <span className="inv-script" style={{ fontSize: 18, color: t.primary }}>{ev.name}</span>
                  <span style={{ height: 1, width: 16, background: t.accent, opacity: 0.6 }} />
                </div>
                <div style={{ fontSize: 10.5, letterSpacing: ".14em", color: t.accent, textTransform: "uppercase", marginBottom: 6 }}>
                  {ed.weekday} {ed.day} {ed.month} · {formatClock(ev.time)}
                </div>
                <div style={{ fontSize: 12, color: t.primary, marginBottom: 3 }}>{ev.venue}</div>
                <div style={{ fontSize: 11, opacity: 0.65 }}>{ev.address}</div>
                {ev.note && <p style={{ fontSize: 10.5, opacity: 0.6, fontStyle: "italic", marginTop: 7 }}>{ev.note}</p>}
              </div>
            </Reveal>
          );
        })}
      </section>

      {/* ── Gallery ── */}
      <section id="ch-gallery" className="inv-sec">
        <Reveal style={{ textAlign: "center", marginBottom: 16 }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>Moments</div>
          <h2 style={{ fontSize: 22, color: t.primary }}>Our favourite frames</h2>
        </Reveal>
        <Reveal><Gallery items={data.gallery} accent={t.accent} radius={2} /></Reveal>
      </section>

      {/* ── Venue ── */}
      <Reveal as="section" className="inv-sec" style={{ textAlign: "center", background: t.primary, color: t.bg }}>
        <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 10 }}>The venue</div>
        <h2 style={{ fontSize: 24, marginBottom: 8 }}>{data.venue.name}</h2>
        <p style={{ fontSize: 12, opacity: 0.82, lineHeight: 1.7, marginBottom: 6 }}>{data.venue.address}</p>
        <p style={{ fontSize: 11, opacity: 0.6, lineHeight: 1.7, marginBottom: 16 }}>{data.venue.directions}</p>
        <MapLink query={data.venue.mapQuery} accent={t.accent} />
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${t.accent}33` }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 7 }}>Dress code</div>
          <div style={{ fontSize: 13, marginBottom: 4 }}>{data.dressCode.title}</div>
          <p style={{ fontSize: 11, opacity: 0.66, lineHeight: 1.6 }}>{data.dressCode.note}</p>
        </div>
      </Reveal>

      {/* ── RSVP ── */}
      <section id="ch-rsvp" className="inv-sec">
        <Reveal style={{ textAlign: "center", marginBottom: 16 }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>Kindly reply</div>
          <h2 style={{ fontSize: 23, color: t.primary }}>Will you join us?</h2>
        </Reveal>
        <Reveal>
          <RSVPCard accent={t.accent} question={data.rsvp.question} deadline={data.rsvp.deadline} events={data.events} />
        </Reveal>
      </section>

      {/* ── Wishes ── */}
      <section className="inv-sec" style={{ background: `${t.accent}14` }}>
        <Reveal style={{ textAlign: "center", marginBottom: 16 }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>Guest wishes</div>
          <h2 style={{ fontSize: 22, color: t.primary }}>Words from our people</h2>
        </Reveal>
        {data.wishes.map((w, i) => (
          <Reveal key={w.name} delay={i * 80}>
            <div style={{ borderLeft: `2px solid ${t.accent}`, paddingLeft: 12, marginBottom: 14 }}>
              <p style={{ fontSize: 11.5, lineHeight: 1.75, fontStyle: "italic", opacity: 0.82 }}>“{w.text}”</p>
              <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: t.accent, marginTop: 6 }}>{w.name}</div>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── Footer ── */}
      <footer style={{ textAlign: "center", padding: "30px 22px 38px", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <Sprig color={t.accent} size={54} />
        </div>
        <div className="inv-script" style={{ fontSize: 22, color: t.primary }}>
          {data.groom.name} &amp; {data.bride.name}
        </div>
        <div style={{ fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: t.accent, marginTop: 8 }}>
          {formatLong(data.weddingDate)}
        </div>
      </footer>
    </div>
  );
}
