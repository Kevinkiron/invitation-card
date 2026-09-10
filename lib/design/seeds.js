/* ══════════════════════════════════════════════════════════════════════
   FIVE EVENTS. ONE RENDERER. ZERO TEMPLATES.

   Everything below is data — exactly the shape the AI produces after the
   questionnaire. Nothing here is markup or CSS. Swap the object, and the
   invitation becomes a different event with a different soul.

   In production these are also the STYLE SEEDS: two or three go into the
   prompt as few-shot examples, and the model interpolates and mutates
   rather than inventing from nothing. That is what gives uniqueness a
   quality floor.
   ══════════════════════════════════════════════════════════════════════ */

export const PRESETS = {

  /* ── 1. Wedding — the reference build ────────────────────────────── */
  wedding: {
    label: "Wedding",
    design: {
      palette: { bg:"#fdf9f1", surface:"#f7efe0", ink:"#334034", muted:"#7d8a7c",
                 accent:"#b8912f", accentSoft:"#e2d4ac", deep:"#2b4433", onDeep:"#fdf9f1" },
      fonts: { display:"'Cormorant Garamond',Georgia,serif", body:"'Jost',sans-serif", script:"'Pinyon Script',cursive" },
      frame:"arch", motif:"botanical", density:.85, reveal:"veil", corner:"soft",
      displayWeight:600, h1Scale:6.6, h1Max:66,
    },
    content: {
      monogram:"A & D",
      epigraph:{ text:"“Two hearts, one journey — and the people who made it possible.”" },
      kicker:"Together with their families",
      headline:"Aarav Menon", headlineB:"Diya Nair", joiner:"with", headlineScript:true,
      subhead:"Saturday, 6th February 2027 · 5:00 PM", place:"St Andrew's Church, Kochi",
      countdownTo:"2027-02-06T17:00:00+05:30",
      footerMark:"Aarav & Diya", footerLine:"06 · 02 · 2027 — Kochi, Kerala",
      sections:[
        { type:"prose", id:"story", eyebrow:"With joy and gratitude", title:"The Invitation", script:true,
          body:"Mr and Mrs Menon cordially invite your esteemed presence and blessings, with family, on the auspicious occasion of the wedding of their son to Diya Nair, daughter of Mr and Mrs Nair. Your presence would mean a great deal to both families." },
        { type:"cards", id:"events", invert:true, eyebrow:"Saturday, 6 February 2027", title:"Order of the Day",
          lede:"We would be honoured to have you with us as we begin our life together.",
          items:[
            { icon:"church", heading:"Holy Matrimony", meta:"5:00 PM", body:"St Andrew's Church, Kochi", link:{label:"View on map",href:"#"} },
            { icon:"home", heading:"Reception", meta:"Following the ceremony", body:"Parish Hall, adjoining the church", link:{label:"View on map",href:"#"} },
          ]},
        { type:"gallery", id:"gallery", eyebrow:"Moments", title:"Our Gallery", script:true,
          lede:"Photographs the couple uploads in chat appear here automatically." },
        { type:"cta", id:"rsvp", eyebrow:"Join us", title:"Will you be there?", script:true,
          lede:"Your love and presence mean the world to us. Do let us know so we can keep a seat with your name on it.",
          button:{label:"RSVP"}, note:"Guests scan the QR at the venue to add their own photos to the shared album." },
      ],
    },
  },

  /* ── 2. Engagement — softer, rounder, celebratory ─────────────────── */
  engagement: {
    label: "Engagement",
    design: {
      palette: { bg:"#fffaf8", surface:"#fdeeea", ink:"#4a3438", muted:"#9c7f81",
                 accent:"#c4788a", accentSoft:"#f2cfd4", deep:"#6d3b4a", onDeep:"#fffaf8" },
      fonts: { display:"'Cormorant Garamond',Georgia,serif", body:"'Jost',sans-serif", script:"'Pinyon Script',cursive" },
      frame:"circle", motif:"confetti", density:.9, reveal:"veil", corner:"soft",
      displayWeight:600, h1Scale:6.4, h1Max:62,
    },
    content: {
      monogram:"M & R",
      epigraph:{ text:"“And so the adventure begins.”" },
      kicker:"Two families, one happy yes",
      headline:"Meera", headlineB:"Rohan", joiner:"&", headlineScript:true,
      subhead:"Saturday, 14th November 2026 · 6:30 PM", place:"Taj Malabar, Kochi",
      countdownTo:"2026-11-14T18:30:00+05:30",
      footerMark:"Meera & Rohan", footerLine:"14 · 11 · 2026 — Kochi",
      sections:[
        { type:"prose", eyebrow:"How it started", title:"Our Story", script:true,
          body:"Five years, three cities and one very persistent group chat later, we are making it official. We would love for you to be in the room when we do." },
        { type:"cards", invert:true, eyebrow:"The evening", title:"How the Night Runs",
          items:[
            { icon:"glass", heading:"Welcome Drinks", meta:"6:30 PM", body:"Terrace lawn, overlooking the backwaters." },
            { icon:"ring", heading:"Ring Ceremony", meta:"7:30 PM", body:"Followed by a few words from both families." },
            { icon:"cake", heading:"Dinner & Dancing", meta:"8:30 PM till late", body:"Grand ballroom. Comfortable shoes encouraged." },
          ]},
        { type:"gallery", eyebrow:"Us, lately", title:"The Album", script:true, lede:"Photographs from the last few years." },
        { type:"cta", eyebrow:"Let us know", title:"Save us a dance", script:true,
          lede:"Kindly reply by the end of October so we can plan the seating.",
          button:{label:"RSVP"}, note:"Add your own photos on the night — the QR code is on every table." },
      ],
    },
  },

  /* ── 3. Tech conference — editorial, sharp, zero romance ──────────── */
  conference: {
    label: "Conference",
    design: {
      palette: { bg:"#0e1116", surface:"#171c24", ink:"#c9d2de", muted:"#7d8899",
                 accent:"#7ee787", accentSoft:"#2b4636", deep:"#f0f4f8", onDeep:"#0e1116" },
      fonts: { display:"'Space Grotesk',sans-serif", body:"'DM Sans',sans-serif", script:"'Space Grotesk',sans-serif" },
      frame:"none", motif:"grid", density:.55, reveal:"none", corner:"sharp", ornament:"&#9670;",
      displayWeight:700, displayCase:"uppercase", displayTracking:"-.02em", h1Scale:7.2, h1Max:78,
      heroBg:"radial-gradient(760px 500px at 50% 8%, #1b2430, transparent 72%)",
    },
    content: {
      kicker:"Kochi · 12–13 March 2027",
      headline:"BUILDSTACK", headlineB:"2027", joiner:"—",
      subhead:"Two days on shipping AI products that survive contact with users",
      place:"Lulu International Convention Centre",
      countdownTo:"2027-03-12T09:00:00+05:30",
      footerMark:"BUILDSTACK", footerLine:"12–13 March 2027 — Kochi, India",
      sections:[
        { type:"cards", eyebrow:"Day one", title:"The Programme",
          lede:"Four tracks, no filler. Every talk is a working engineer describing something they actually shipped.",
          items:[
            { icon:"code", heading:"Systems", meta:"09:30 — 12:00", body:"Retrieval, evals and the unglamorous plumbing that decides whether a model is useful." },
            { icon:"mic", heading:"Product", meta:"13:00 — 15:30", body:"Interface patterns for probabilistic software, and what to do when it is wrong." },
            { icon:"users", heading:"Teams", meta:"15:45 — 17:30", body:"Hiring, review and shipping cadence for teams building on models they do not control." },
            { icon:"talk", heading:"Open Floor", meta:"17:30 — late", body:"Unconference. Claim a slot on the board and hold court." },
          ]},
        { type:"detail", invert:true, eyebrow:"Practical", title:"Details",
          rows:[
            { label:"Dates", value:"12–13 March 2027" },
            { label:"Venue", value:"Lulu ICC, Kochi" },
            { label:"Format", value:"In person · 400 seats" },
            { label:"Early bird", value:"₹ 6,500 until 31 Jan" },
            { label:"Standard", value:"₹ 9,000" },
          ]},
        { type:"cards", eyebrow:"Speaking", title:"Confirmed",
          items:[
            { icon:"star", heading:"Ananya Rao", meta:"Principal Engineer, Zerodha", body:"On evaluation harnesses that survive a real production load." },
            { icon:"star", heading:"Marcus Feld", meta:"Founder, Latch", body:"Six rewrites of one retrieval pipeline, and what each one taught us." },
            { icon:"star", heading:"Priya Nair", meta:"Head of Design, Freshworks", body:"Designing interfaces that admit uncertainty without losing the user." },
          ]},
        { type:"cta", eyebrow:"Seats are limited", title:"Register",
          lede:"Tickets include both days, lunch, and the recordings afterwards.",
          button:{label:"Get a ticket"}, note:"Group rates for four or more — write to hello@buildstack.dev" },
      ],
    },
  },

  /* ── 4. Concert — loud, poster-like, typographic ──────────────────── */
  concert: {
    label: "Concert",
    design: {
      palette: { bg:"#120a1f", surface:"#1e1033", ink:"#e6dcf5", muted:"#9b8bb8",
                 accent:"#ff2e88", accentSoft:"#4a1f52", deep:"#ffd93d", onDeep:"#120a1f" },
      fonts: { display:"'Bebas Neue',Impact,sans-serif", body:"'Space Grotesk',sans-serif", script:"'Bebas Neue',sans-serif" },
      frame:"none", motif:"waves", density:1, reveal:"none", corner:"sharp", ornament:"&#9650;",
      displayWeight:400, displayCase:"uppercase", displayTracking:".01em", h1Scale:13, h1Max:150,
      heroBg:"radial-gradient(820px 520px at 50% 30%, #2c1350, transparent 70%)",
    },
    content: {
      kicker:"One night only",
      headline:"NEON MONSOON", joiner:"",
      subhead:"Live at Fort Kochi · Saturday 5 December 2026 · Doors 7 PM",
      place:"Parade Ground, Fort Kochi",
      countdownTo:"2026-12-05T19:00:00+05:30",
      footerMark:"NEON MONSOON", footerLine:"05 · 12 · 2026 — Fort Kochi",
      sections:[
        { type:"cards", eyebrow:"The bill", title:"Line-up",
          lede:"Four acts. One stage. No overlap, so you will not have to choose.",
          items:[
            { icon:"mic", heading:"Thaikkudam Sunset", meta:"21:45 — Headline", body:"Their first Kerala show in three years." },
            { icon:"mic", heading:"When Chai Met Toast", meta:"20:30", body:"Full band, full set." },
            { icon:"mic", heading:"Parvaaz", meta:"19:30", body:"Srinagar psych-rock, loud and unhurried." },
            { icon:"mic", heading:"DJ Ma'am Sir", meta:"19:00 — Opening", body:"Warm-up set as the gates open." },
          ]},
        { type:"detail", invert:true, eyebrow:"Tickets", title:"Entry",
          rows:[
            { label:"Early bird", value:"₹ 1,200 — sold out" },
            { label:"General", value:"₹ 1,800" },
            { label:"Gold pit", value:"₹ 3,500" },
            { label:"Age", value:"18+ · photo ID required" },
            { label:"Gates", value:"6:30 PM" },
          ]},
        { type:"gallery", eyebrow:"Last year", title:"The Crowd", lede:"Monsoon 2025, same ground, twelve thousand people." },
        { type:"cta", eyebrow:"Before they go", title:"Grab your tickets",
          lede:"Gold pit is capped at 300 and usually goes within the week.",
          button:{label:"Book now"}, note:"Tag your photos on the night — they land straight in the shared gallery above." },
      ],
    },
  },

  /* ── 5. Milestone birthday — warm, classic, unfussy ───────────────── */
  birthday: {
    label: "60th Birthday",
    design: {
      palette: { bg:"#fdf6ee", surface:"#f7e7d5", ink:"#3d2b21", muted:"#8d7461",
                 accent:"#c26b3c", accentSoft:"#eccdb0", deep:"#5c3a24", onDeep:"#fdf6ee" },
      fonts: { display:"'Playfair Display',Georgia,serif", body:"'DM Sans',sans-serif", script:"'Playfair Display',serif" },
      frame:"circle", motif:"rings", density:.7, reveal:"veil", corner:"soft",
      displayWeight:700, h1Scale:6.8, h1Max:70,
    },
    content: {
      monogram:"60",
      epigraph:{ text:"“Count your age by friends, not years.”" },
      kicker:"Please join us for",
      headline:"Sixty Years", headlineB:"Thomas", joiner:"of",
      subhead:"Sunday, 7th February 2027 · 12:30 PM", place:"Backwater Retreat, Alleppey",
      countdownTo:"2027-02-07T12:30:00+05:30",
      footerMark:"Thomas at 60", footerLine:"07 · 02 · 2027 — Alleppey",
      sections:[
        { type:"prose", eyebrow:"From the family", title:"A Long Lunch",
          body:"Appa turns sixty, and he has asked for exactly one thing: everybody he likes, in one place, for an afternoon. No speeches longer than two minutes. That rule is being enforced." },
        { type:"cards", invert:true, eyebrow:"The afternoon", title:"How the Day Runs",
          items:[
            { icon:"glass", heading:"Arrival", meta:"12:30 PM", body:"Drinks on the lawn by the water." },
            { icon:"cake", heading:"Lunch", meta:"1:30 PM", body:"Kerala sadhya, served on the veranda." },
            { icon:"star", heading:"Two-minute speeches", meta:"3:00 PM", body:"Timed. Genuinely timed." },
          ]},
        { type:"gallery", eyebrow:"Six decades", title:"The Archive", lede:"Photographs we found in a biscuit tin. Bring more if you have them." },
        { type:"cta", eyebrow:"One last thing", title:"Let us know you're coming",
          lede:"So we can tell the kitchen. No gifts — he means it this time.",
          button:{label:"Count me in"}, note:"Scan the QR on the day to add your photos to the family album." },
      ],
    },
  },
};
