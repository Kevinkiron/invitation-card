/* ══════════════════════════════════════════════════════════════════════
   THE COUPLE ON THE DOORS (components/invite/GrandEntrance.js)

   The bride is inlaid on the left door and the groom on the right, in
   profile like a miniature painting, facing each other across the seal.
   Each one is gold foil with a fine engraved line: on arrival the lines
   draw themselves in, the foil fills behind them, then a slow shimmer
   keeps passing over. The garlands and the veil sway a little.

   Two sets:
     indian   bride in lehenga and dupatta, maang tikka and nath, holding a
              varmala; groom in sherwani, safa with a kalgi, holding his
     western  bride in a gown and long veil with a bouquet; groom in a
              tailcoat and bow tie, offering a single rose

   Every figure is drawn facing right; the groom is mirrored by CSS so
   he faces left, toward her.

   Every shape carries pathLength="1" so one CSS rule can draw any of them
   (stroke-dasharray: 1). See app/grand-entrance.css, "the couple".
   ══════════════════════════════════════════════════════════════════════ */

const S = { className: "s", pathLength: 1 };

function Foil({ id }) {
  const lin = (k, a, b) => (
    <linearGradient id={`${id}-${k}`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} />
    </linearGradient>
  );
  return (
    <defs>
      <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="200" y2="400">
        <stop offset="0" stopColor="#b8862f" />
        <stop offset=".38" stopColor="#ecc976" />
        <stop offset=".5" stopColor="#fff4cf" />
        <stop offset=".62" stopColor="#ecc976" />
        <stop offset="1" stopColor="#b8862f" />
        <animateTransform attributeName="gradientTransform" type="translate" values="-260 -520; 260 520" dur="6s" repeatCount="indefinite" />
      </linearGradient>
      {/* enamel colours for the clothes, as in meenakari on gold */}
      {lin("red", "#c8203f", "#6e0a1d")}
      {lin("rose", "#e0405e", "#9c1530")}
      {lin("ivory", "#fffaf0", "#dcc89e")}
      {lin("saffron", "#ffb02e", "#d1491b")}
      {lin("navy", "#2e4174", "#0f1832")}
      {lin("white", "#ffffff", "#e6dccb")}
    </defs>
  );
}

/* a garland of marigolds with a rose every few flowers, hung from (x0,y0)
   to (x1,y1) with a sag */
function Garland({ x0, y0, x1, y1, sag = 60, n = 15, cls = "ge-garland" }) {
  const pts = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const mx = (x0 + x1) / 2, my = Math.max(y0, y1) + sag;
    const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * mx + t * t * x1;
    const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * my + t * t * y1;
    return [x, y];
  });
  return (
    <g className={cls}>
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={i % 5 === 2 ? 4.6 : 4.2} fill={i % 5 === 2 ? "#c81d3a" : i % 2 ? "#ffb300" : "#f57c00"} />
          <circle cx={x - 1.2} cy={y - 1.2} r="1.3" fill="#fff3c4" opacity=".7" />
        </g>
      ))}
    </g>
  );
}

function IndianBride({ f, e }) {
  return (
    <>
      {/* dupatta, over the head and down the back to the ground */}
      <g className="ge-sway">
        <path {...S} className="s veil" fill={e("rose")} d="M108 44 C90 36 74 46 72 66 C69 96 62 128 57 168 C50 236 40 306 28 386 L66 386 C72 306 80 232 88 160 C90 120 94 88 104 58 Z" />
        <path {...S} fill="none" d="M62 168 C55 236 46 306 36 384 M70 120 C66 140 64 152 63 166" />
        {Array.from({ length: 9 }, (_, i) => <circle key={i} cx={36 + i * 1.2 + (i % 2) * 6} cy={180 + i * 22} r="1.6" className="dot" />)}
      </g>
      {/* lehenga */}
      <path {...S} fill={e("red")} d="M90 158 L119 158 C133 220 152 300 166 380 Q101 397 36 380 C56 300 76 220 90 158 Z" />
      <path {...S} fill="none" d="M44 352 Q102 368 160 352 M40 366 Q102 383 163 366 M98 166 L80 376 M106 166 L110 382 M113 166 L140 378" />
      {Array.from({ length: 11 }, (_, i) => <circle key={i} cx={46 + i * 11} cy={359 + Math.sin((i / 10) * Math.PI) * 7} r="1.8" className="dot" />)}
      {/* choli */}
      <path {...S} fill={e("red")} d="M92 104 C84 106 81 113 84 126 L89 160 L118 160 L119 148 C122 134 121 118 115 108 C111 104 106 104 104 104 Z" />
      {/* dupatta pallu over the shoulder, across the front */}
      <path {...S} fill="none" d="M88 110 C100 128 112 146 119 158 M84 124 C96 140 108 152 117 160" />
      {/* face in profile */}
      <path {...S} fill={f} d="M108 50 C112 54 114 60 114 64 L119.5 72 L115 75 C116 77 116 79 114 80 C116 82 115 85 112 87 C109 90 104 92 104 96 L104 106 L92 106 C90 92 88 80 92 66 C95 56 101 50 108 50 Z" />
      {/* the dupatta's border framing the face */}
      <path {...S} fill="none" d="M111 46 C97 45 89 56 88 72 C87 86 89 98 91 106" strokeWidth="2.2" />
      <path className="s ln" pathLength="1" fill="none" d="M107 62 Q110 60 113 62 M106 58 Q110 55 114 58" />
      {/* jewellery: tikka, nath, jhumka */}
      <circle className="gem" cx="111" cy="51" r="2.2" />
      <path className="s" pathLength="1" fill="none" d="M108 46 L111 49" />
      <circle className="s" pathLength="1" cx="116.5" cy="77" r="3.2" fill="none" />
      <path className="s" pathLength="1" fill={f} d="M97 82 L97 86 C93 88 93 92 97 93 C101 92 101 88 97 86" />
      {/* arm and hands holding the garland toward him */}
      <path {...S} fill={f} d="M110 110 C118 118 120 130 120 140 C126 140 132 136 140 133 L142 139 C133 143 125 148 116 148 C112 140 108 124 105 114 Z" />
      {Array.from({ length: 4 }, (_, i) => <path key={i} className="s" pathLength="1" fill="none" d={`M${121 + i * 0.6} ${134 + i * 3} l5 -1`} />)}
      <Garland x0={140} y0={136} x1={188} y1={150} sag={70} />
    </>
  );
}

function IndianGroom({ f, e }) {
  return (
    <>
      {/* turban tail down the back */}
      <g className="ge-sway">
        <path {...S} fill={e("saffron")} d="M90 58 C78 72 72 104 66 150 L78 150 C82 112 86 84 94 66 Z" />
        <path {...S} fill="none" d="M84 74 L72 140 M88 72 L77 144" />
      </g>
      {/* stole behind the shoulder */}
      <path {...S} fill={e("red")} d="M86 108 C100 146 106 210 106 270 L96 272 C94 212 88 156 78 118 Z" />
      {/* sherwani to the knee */}
      <path {...S} fill={e("ivory")} d="M92 104 C82 106 78 114 80 130 L74 292 L128 292 L123 160 C125 130 123 112 112 106 Z" />
      <path {...S} fill="none" d="M76 274 L127 274 M75 282 L128 282 M117 112 L121 272" />
      {Array.from({ length: 8 }, (_, i) => <circle key={i} className="gem" cx={118 + i * 0.4} cy={122 + i * 19} r="2" />)}
      {/* churidar and mojari */}
      <path {...S} fill={e("ivory")} d="M84 290 L86 372 L99 372 L101 290 Z M103 290 L106 372 L119 372 L121 290 Z" />
      <path {...S} fill="none" d="M86 340 L99 340 M86 352 L99 352 M106 340 L119 340 M106 352 L119 352" />
      <path {...S} fill={f} d="M84 371 L100 371 C106 373 112 373 117 366 C115 378 104 383 84 382 Z M104 371 L120 371 C126 373 132 373 137 366 C135 378 124 383 104 382 Z" />
      {/* face, with a moustache */}
      <path {...S} fill={f} d="M112 60 C114 63 115 66 115 69 L120.5 76 L116 79 C117 81 117 83 115 84 C117 87 115 91 111 93 C108 95 104 96 104 101 L104 108 L92 108 C90 94 88 80 90 64 Z" />
      <path className="s ln" pathLength="1" fill="none" d="M108 70 Q111 68 114 70 M115 81 C112 83 108 83 106 81" />
      <path className="s ln" pathLength="1" fill="none" d="M97 96 L96 108 M100 104 L110 104" />
      {/* safa with its wraps, the kalgi brooch and plume */}
      <path {...S} fill={e("saffron")} d="M88 66 C80 50 90 32 107 32 C122 32 129 44 123 60 L120 64 C110 59 98 60 88 66 Z" />
      <path {...S} fill="none" d="M90 58 C100 50 112 48 122 52 M92 48 C102 40 114 40 123 44 M98 38 C106 34 116 35 121 38" />
      <path {...S} fill={f} d="M118 42 C121 28 112 16 102 13 C111 22 114 31 115 42 Z" />
      <circle className="gem" cx="118" cy="45" r="3.4" />
      {/* arm and hands with his garland */}
      <path {...S} fill={f} d="M112 112 C120 122 122 136 122 148 C128 148 134 144 142 141 L144 147 C135 151 127 156 117 156 C112 146 108 128 104 118 Z" />
      <Garland x0={142} y0={144} x1={188} y1={156} sag={70} />
    </>
  );
}

function WesternBride({ f, e }) {
  return (
    <>
      {/* the veil, long and sheer */}
      <g className="ge-sway">
        <path {...S} className="s veil" fill={e("white")} d="M98 50 C84 50 76 62 74 80 C70 130 58 230 30 388 L84 388 C82 300 84 200 90 110 Z" />
        <path {...S} fill="none" d="M70 140 C62 220 50 300 38 384 M80 150 C76 230 72 300 70 384" />
      </g>
      {/* gown */}
      <path {...S} fill={e("white")} d="M90 156 L118 156 C140 214 160 300 170 384 Q101 398 32 384 C46 300 68 214 90 156 Z" />
      <path {...S} fill="none" d="M97 162 C90 240 76 320 66 386 M104 162 L104 390 M111 162 C122 240 136 320 144 386 M40 366 Q101 380 166 366" />
      {/* bodice */}
      <path {...S} fill={e("white")} d="M92 106 C85 110 84 120 87 132 L90 158 L118 158 L119 140 C121 126 119 112 113 106 Z" />
      <path {...S} fill="none" d="M88 122 Q103 116 119 122 M89 150 Q104 146 118 150" />
      {/* face, hair in a bun, tiara */}
      <path {...S} fill={f} d="M108 52 C112 56 114 61 114 65 L119.5 73 L115 76 C116 78 116 80 114 81 C116 83 115 86 112 88 C109 91 105 93 105 97 L105 106 L93 106 C91 92 88 80 92 66 C95 57 101 52 108 52 Z" />
      <path {...S} fill={f} d="M110 52 C100 42 84 46 82 62 C80 74 86 84 92 88 C90 76 92 62 100 56 Z" />
      <circle {...S} fill={f} cx="83" cy="58" r="8" />
      <path className="s ln" pathLength="1" fill="none" d="M107 64 Q110 62 113 64 M92 48 L96 42 L100 47 L104 41 L107 48" />
      <circle className="gem" cx="104" cy="42" r="1.8" />
      {/* arms and the bouquet */}
      <path {...S} fill={f} d="M111 110 C118 120 120 136 118 150 C124 152 130 150 134 146 L136 152 C128 158 120 160 112 158 C110 142 108 126 104 116 Z" />
      <g className="ge-garland">
        {[[140, 146, 7, "#f3e6e8"], [149, 140, 6, "#ffffff"], [148, 152, 6.5, "#f2c6cf"], [138, 156, 6, "#ffffff"], [156, 148, 5, "#f3e6e8"], [144, 136, 5, "#f2c6cf"]].map(([x, y, r, c], i) => (
          <g key={i}><circle cx={x} cy={y} r={r} fill={c} stroke="#c9a24a" strokeWidth=".8" /><circle cx={x} cy={y} r={r * 0.35} fill="none" stroke="#d9a7b0" strokeWidth=".8" /></g>
        ))}
        <path d="M150 158 l6 14 M146 160 l1 16 M142 160 l-4 14" stroke="#4f7d48" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M136 164 C140 178 150 196 146 214 M152 166 C152 186 160 200 156 216" stroke="#efe2c4" strokeWidth="1.6" fill="none" />
      </g>
    </>
  );
}

function WesternGroom({ f, e }) {
  return (
    <>
      {/* tailcoat */}
      <path {...S} fill={e("navy")} d="M92 106 C82 108 79 116 80 132 L78 226 C76 250 74 270 72 288 L90 288 L94 214 L120 214 L122 150 C124 126 122 112 112 106 Z" />
      <path {...S} fill="none" d="M100 106 L112 160 L106 214 M112 106 L116 128 M86 150 L88 210" />
      <circle className="gem" cx="113" cy="174" r="1.8" /><circle className="gem" cx="112" cy="194" r="1.8" />
      {/* trousers and shoes */}
      <path {...S} fill={e("navy")} d="M92 212 L88 372 L102 372 L106 212 Z M106 212 L108 372 L122 372 L120 212 Z" />
      <path {...S} fill="#14141c" d="M86 371 L103 371 C110 372 116 374 118 380 L86 381 Z M106 371 L123 371 C130 372 136 374 138 380 L106 381 Z" />
      {/* bow tie and boutonniere */}
      <path {...S} fill={f} d="M104 104 L98 99 L98 109 Z M104 104 L110 99 L110 109 Z" />
      <circle cx="110" cy="124" r="3.2" fill="#c81d3a" /><path d="M110 127 l-2 6" stroke="#4f7d48" strokeWidth="1.6" />
      {/* face and hair */}
      <path {...S} fill={f} d="M112 58 C114 62 115 66 115 69 L120.5 76 L116 79 C117 81 117 83 115 84 C117 87 115 91 111 93 C108 95 104 96 104 101 L104 104 L92 104 C90 92 88 78 90 64 Z" />
      <path {...S} fill={f} d="M88 70 C82 52 94 38 108 40 C118 41 124 48 121 58 C112 54 102 54 96 60 C94 64 92 68 92 74 Z" />
      <path className="s ln" pathLength="1" fill="none" d="M108 70 Q111 68 114 70 M96 52 C104 46 114 46 120 50" />
      {/* arm offering a rose */}
      <path {...S} fill={f} d="M112 112 C120 122 122 136 122 148 C128 148 134 145 141 141 L143 147 C135 152 127 156 117 156 C112 146 108 128 104 118 Z" />
      <g className="ge-garland">
        <path d="M142 144 C150 138 158 128 166 120" stroke="#4f7d48" strokeWidth="2" fill="none" />
        <path d="M154 132 c4 -6 10 -6 12 -2 c-4 2 -8 3 -12 2" fill="#4f7d48" />
        <circle cx="168" cy="117" r="7" fill="#c81d3a" stroke="#7d0f22" strokeWidth="1" />
        <path d="M164 116 c2 -4 7 -4 8 0 c-2 3 -6 3 -8 0" fill="none" stroke="#7d0f22" strokeWidth="1" />
      </g>
    </>
  );
}

export function CoupleFigure({ who, style = "indian", id }) {
  const f = `url(#${id})`;
  const e = (k) => `url(#${id}-${k})`;
  const Fig = style === "western"
    ? (who === "bride" ? WesternBride : WesternGroom)
    : (who === "bride" ? IndianBride : IndianGroom);
  return (
    <svg className={`ge-fig ge-fig-${who}`} viewBox="0 0 200 400" aria-hidden="true">
      <Foil id={id} />
      <Fig f={f} e={e} />
      {/* a few sparkles around them */}
      {[[40, 30, 0], [170, 60, 1.1], [24, 200, 2.2], [178, 250, .6], [150, 330, 1.7]].map(([x, y, d], i) => (
        <path key={i} className="ge-spark" style={{ animationDelay: `${2.6 + d}s` }} d={`M${x} ${y - 6} L${x + 1.6} ${y - 1.6} L${x + 6} ${y} L${x + 1.6} ${y + 1.6} L${x} ${y + 6} L${x - 1.6} ${y + 1.6} L${x - 6} ${y} L${x - 1.6} ${y - 1.6} Z`} fill="#fff3c4" />
      ))}
    </svg>
  );
}
