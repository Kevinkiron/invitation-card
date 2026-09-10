"use client";

import { useEffect, useState } from "react";
import { Sprig, WaxSeal, CornerFlourish } from "@/components/invitation/ornaments";
import {
  Countdown, Gallery, RSVPCard, Petals, Reveal,
  formatDayMonth, formatClock, MapLink, formatLong,
} from "@/components/invitation/parts";

/* EMERALD ENVELOPE — opens like a real letter.
   Distinct structure: a closed envelope gate the guest must open, then an
   arch-cropped hero, a centred vertical ceremony timeline with a spine
   rail, and botanical sprig dividers between every section. */
export default function EmeraldEnvelope({ data, mode = "gallery" }) {
  const t = { primary: "#1E4D3B", accent: "#B99A55", bg: "#F6F2E6", text: "#20302A" };
  const d = formatDayMonth(data.weddingDate);
  const compact = mode === "gallery";

  // In the gallery the envelope opens itself so the card never sits on a
  // closed flap; everywhere else the guest performs the reveal.
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (mode !== "gallery") return;
    const id = setTimeout(() => setOpen(true), 1600);
    return () => clearTimeout(id);
  }, [mode]);

  const initials = `${data.groom.name?.[0] || "S"}&${data.bride.name?.[0] || "D"}`;

  return (
    <div
      className="inv-root inv-paper"
      style={{
        "--tpl-primary": t.primary, "--tpl-accent": t.accent,
        "--tpl-bg": t.bg, "--tpl-text": t.text,
        "--tpl-heading-font": "'Marcellus', Georgia, serif",
      }}
    >
      {/* ── The envelope gate ── */}
      <section
        className={`inv-envelope ${open ? "is-open" : ""}`}
        style={{
          position: "relative", height: open ? 0 : compact ? 430 : 520,
          overflow: "hidden", background: t.primary,
          transition: "height 1.1s var(--tpl-ease)",
        }}
        aria-hidden={open}
      >
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(150deg, ${t.primary} 0%, #14382B 55%, #0E2A20 100%)` }} />
        {/* flap */}
        <div
          className="inv-envelope-flap"
          style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "46%",
            background: `linear-gradient(180deg, #235944 0%, #17402F 100%)`,
            clipPath: "polygon(0 0, 100% 0, 50% 100%)",
            borderBottom: `1px solid ${t.accent}44`,
          }}
        />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <div style={{ marginBottom: 18 }}>
            <Sprig color={t.accent} size={46} rotate={-14} />
          </div>
          <div style={{ fontSize: 9.5, letterSpacing: ".3em", textTransform: "uppercase", color: `${t.accent}`, marginBottom: 10 }}>
            {data.guestName ? `For ${data.guestName}` : "You are invited"}
          </div>
          <div className="inv-script" style={{ fontSize: 26, color: "#F6F2E6", lineHeight: 1.2, marginBottom: 22 }}>
            {data.groom.name} &amp; {data.bride.name}
          </div>
          <button
            onClick={() => setOpen(true)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
            aria-label="Open the invitation"
          >
            <WaxSeal color="#8E2B3F" initials={initials} size={72} />
            <span style={{ fontSize: 9.5, letterSpacing: ".24em", textTransform: "uppercase", color: t.accent, fontWeight: 700, fontFamily: "var(--tpl-body-font)" }}>
              Break the seal
            </span>
          </button>
        </div>
      </section>

      {/* ── Everything below reveals once opened ── */}
      <div style={{ opacity: open ? 1 : 0, transition: "opacity .9s var(--tpl-ease) .35s" }}>
        {/* Hero */}
        <section style={{ position: "relative", padding: "34px 22px 30px", textAlign: "center", overflow: "hidden" }}>
          <Petals count={11} colors={["#CBD9C4", "#E8DCC0", "#B99A55"]} duration={15} />
          <div style={{ position: "absolute", top: 10, left: 8 }}><CornerFlourish color={t.accent} size={46} /></div>
          <div style={{ position: "absolute", top: 10, right: 8 }}><CornerFlourish color={t.accent} size={46} flipX /></div>

          <div style={{ position: "relative" }}>
            {/* arch-cropped portrait */}
            <div
              className="inv-art"
              data-art="sage"
              style={{ width: 132, height: 168, margin: "0 auto 20px", borderRadius: "66px 66px 4px 4px", border: `1px solid ${t.accent}66` }}
            />
            <div className="inv-eyebrow" style={{ color: t.primary, marginBottom: 12 }}>Together with their families</div>
            <h1 className="inv-script" style={{ fontSize: compact ? 32 : 38, color: t.primary, lineHeight: 1.14 }}>
              {data.groom.name}
              <span style={{ display: "block", fontSize: 15, color: t.accent, margin: "6px 0" }}>&amp;</span>
              {data.bride.name}
            </h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18, color: t.accent }}>
              <span style={{ height: 1, width: 24, background: "currentColor", opacity: 0.6 }} />
              <span style={{ fontSize: 10.5, letterSpacing: ".2em" }}>{d.day} {d.month} {d.year}</span>
              <span style={{ height: 1, width: 24, background: "currentColor", opacity: 0.6 }} />
            </div>
            <p style={{ fontSize: 11.5, opacity: 0.72, lineHeight: 1.75, marginTop: 16, fontStyle: "italic" }}>{data.blessing}</p>
          </div>
        </section>

        <Divider color={t.accent} />

        {/* Countdown */}
        <Reveal as="section" className="inv-sec-tight" style={{ textAlign: "center" }}>
          <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 14 }}>Until we say “I do”</div>
          <Countdown
            date={data.weddingDate}
            cellStyle={{ background: `${t.primary}0d`, border: `1px solid ${t.primary}1f`, borderRadius: 3 }}
            numStyle={{ color: t.primary }}
            labelStyle={{ color: t.primary, opacity: 0.6 }}
          />
        </Reveal>

        <Divider color={t.accent} />

        {/* Timeline with a centre spine */}
        <section className="inv-sec" style={{ background: `${t.primary}0a` }}>
          <Reveal style={{ textAlign: "center", marginBottom: 22 }}>
            <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>The order of the day</div>
            <h2 style={{ fontSize: 23, color: t.primary }}>Ceremony timeline</h2>
          </Reveal>

          <div style={{ position: "relative", paddingLeft: 30 }}>
            <span style={{ position: "absolute", left: 9, top: 6, bottom: 6, width: 1, background: `${t.accent}59` }} />
            {data.events.map((ev, i) => (
              <Reveal key={ev.name} delay={i * 80}>
                <div style={{ position: "relative", paddingBottom: 22 }}>
                  <span style={{ position: "absolute", left: -25, top: 3, width: 11, height: 11, borderRadius: "50%", background: t.bg, border: `1.6px solid ${t.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ width: 4, height: 4, borderRadius: "50%", background: t.accent }} />
                  </span>
                  <div style={{ fontSize: 9.5, letterSpacing: ".2em", textTransform: "uppercase", color: t.accent, marginBottom: 4 }}>
                    {formatDayMonth(ev.date).weekday} · {formatClock(ev.time)}
                  </div>
                  <h3 style={{ fontSize: 17, color: t.primary, marginBottom: 5 }}>{ev.name}</h3>
                  <div style={{ fontSize: 11.5, opacity: 0.78 }}>{ev.venue}</div>
                  <div style={{ fontSize: 10.5, opacity: 0.6 }}>{ev.address}</div>
                  {ev.note && <p style={{ fontSize: 10.5, opacity: 0.58, fontStyle: "italic", marginTop: 5 }}>{ev.note}</p>}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <Divider color={t.accent} />

        {/* Story */}
        <section className="inv-sec" style={{ textAlign: "center" }}>
          <Reveal>
            <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>How it began</div>
            <h2 style={{ fontSize: 22, color: t.primary, marginBottom: 12 }}>{data.story.title}</h2>
            <p style={{ fontSize: 12, lineHeight: 1.85, opacity: 0.76 }}>{data.story.body}</p>
          </Reveal>
        </section>

        {/* Gallery */}
        <section className="inv-sec" style={{ paddingTop: 0 }}>
          <Reveal style={{ textAlign: "center", marginBottom: 14 }}>
            <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>Our album</div>
          </Reveal>
          <Reveal><Gallery items={data.gallery} accent={t.accent} radius={3} /></Reveal>
        </section>

        {/* Venue */}
        <Reveal as="section" className="inv-sec" style={{ textAlign: "center", background: t.primary, color: "#F1EEE2" }}>
          <Sprig color={t.accent} size={40} rotate={0} />
          <div className="inv-eyebrow" style={{ color: t.accent, margin: "10px 0" }}>Where</div>
          <h2 style={{ fontSize: 23, marginBottom: 8 }}>{data.venue.name}</h2>
          <p style={{ fontSize: 12, opacity: 0.82, lineHeight: 1.7, marginBottom: 4 }}>{data.venue.address}</p>
          <p style={{ fontSize: 11, opacity: 0.6, marginBottom: 16 }}>{data.venue.directions}</p>
          <MapLink query={data.venue.mapQuery} accent={t.accent} />
        </Reveal>

        {/* RSVP */}
        <section className="inv-sec">
          <Reveal style={{ textAlign: "center", marginBottom: 16 }}>
            <div className="inv-eyebrow" style={{ color: t.accent, marginBottom: 8 }}>RSVP</div>
            <h2 style={{ fontSize: 22, color: t.primary }}>{data.rsvp.question}</h2>
          </Reveal>
          <Reveal><RSVPCard accent={t.accent} question="Let us know if you can make it." deadline={data.rsvp.deadline} events={data.events} /></Reveal>
        </section>

        {/* Wax seal footer */}
        <footer style={{ textAlign: "center", padding: "28px 22px 40px", background: `${t.primary}0d` }}>
          <WaxSeal color="#8E2B3F" initials={initials} size={58} />
          <div className="inv-script" style={{ fontSize: 20, color: t.primary, marginTop: 12 }}>
            {data.groom.name} &amp; {data.bride.name}
          </div>
          <div style={{ fontSize: 9.5, letterSpacing: ".2em", textTransform: "uppercase", color: t.accent, marginTop: 7 }}>
            {formatLong(data.weddingDate)}
          </div>
        </footer>
      </div>
    </div>
  );
}

function Divider({ color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "4px 22px", color }}>
      <span style={{ height: 1, flex: 1, background: "currentColor", opacity: 0.28 }} />
      <Sprig color={color} size={26} rotate={90} />
      <span style={{ height: 1, flex: 1, background: "currentColor", opacity: 0.28 }} />
    </div>
  );
}
