"use client";

/* The "I agree" box — shown at sign-up and above every Pay button, and
   required before either can go ahead. Links open in a new tab so ticking
   it never loses what the person was in the middle of. */
export default function AgreeTerms({ checked, onChange, children, style }) {
  return (
    <label className="agree-terms" style={style}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} required />
      <span>
        {children || "I agree to the"}{" "}
        <a href="/terms" target="_blank" rel="noreferrer">Terms &amp; Conditions</a>,{" "}
        including the <a href="/terms#refunds" target="_blank" rel="noreferrer">no-refund policy</a> once published, and the{" "}
        <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>. I have the rights to any photos and music I upload.
      </span>
    </label>
  );
}
