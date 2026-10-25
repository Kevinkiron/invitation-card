import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { BASE_PRICE, ADDON_PRICE } from "@/lib/pricing";
import { COMPANY } from "@/lib/company";

/* ══════════════════════════════════════════════════════════════════════
   /terms — Terms & Conditions, with the refund and cancellation policy
   that Razorpay asks every merchant to publish.

   A sensible default for a small Indian digital-goods site, written in
   plain English. It is NOT legal advice — have it read by a lawyer.
   The company details come from lib/company.js.
   ══════════════════════════════════════════════════════════════════════ */

const OWNER = {
  legalName: COMPANY.legalName,
  email: COMPANY.email,
  city: COMPANY.jurisdiction,
};

const UPDATED = "25 October 2026";

export const metadata = {
  title: "Terms & Conditions — Welcvm",
  description: "The terms for using Welcvm's digital invitations and greeting cards, including payments, refunds and cancellations.",
};

const who = OWNER.legalName || "the operator of welcvm.com";
const contact = OWNER.email
  ? <a href={`mailto:${OWNER.email}`}>{OWNER.email}</a>
  : <>the contact details on <Link href="/">welcvm.com</Link></>;

const SECTIONS = [
  ["about", "1. About these terms", (
    <>
      <p>Welcvm (&ldquo;Welcvm&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is run by {who}, {COMPANY.address}. These terms apply to everyone who uses welcvm.com — people who create invitations or greeting cards (&ldquo;you&rdquo;) and the guests and recipients who open them.</p>
      <p>By creating an account, making something or paying on Welcvm you agree to these terms. If you do not agree, please do not use the site.</p>
    </>
  )],
  ["service", "2. What Welcvm provides", (
    <>
      <p>Welcvm lets you design digital invitations (weddings, birthdays, housewarmings and other events) and greeting cards, and share each one as a web link. Invitations can include RSVPs, directions, music, photos and a shared album; cards open from an envelope with your message, photo and music.</p>
      <p>Designs are produced with the help of automated tools, including AI. You will see your design before you pay, and you can edit it after publishing.</p>
    </>
  )],
  ["account", "3. Your account", (
    <>
      <p>You need an account to create and publish. Keep your login details private; you are responsible for what is done through your account. You must be at least 18, or have a parent or guardian&rsquo;s permission.</p>
    </>
  )],
  ["content", "4. Your content", (
    <>
      <p>You keep ownership of the names, words, photos and music you add. You give us permission to store, display and process them only as needed to make, host and share your invitation or card.</p>
      <p>You confirm that you have the right to use everything you upload — in particular photos of other people and music — and that it does not break any law or anyone else&rsquo;s rights. Do not use Welcvm for anything unlawful, hateful, misleading or harmful. We may remove content or suspend accounts that do.</p>
      <p>Anyone who has the link to an invitation or card can open it. Share links only with the people you mean to. How we handle photos and other personal information is set out in our <Link href="/privacy">Privacy Policy</Link>.</p>
      <p><b>Music you upload.</b> You alone are responsible for any song or audio you attach. Welcvm does not check uploaded music and is not responsible for any copyright, licensing or royalty claim arising from it. If a rights holder complains, we may remove the track or the invitation or card without a refund, and you agree to cover any cost, claim or loss we face because of music or other content you uploaded. The ready-made tunes Welcvm offers are licensed for use inside Welcvm only.</p>
    </>
  )],
  ["pricing", "5. Prices and payment", (
    <>
      <p>Making and previewing is free. Publishing an invitation or a greeting card costs <b>₹{BASE_PRICE}</b>. Optional add-ons — background music, background colour and photos — cost <b>₹{ADDON_PRICE} each</b>. The total is shown before you pay, and you pay once, at the moment you publish.</p>
      <p>Payments are processed securely by Razorpay (UPI, cards, net banking and wallets). We do not see or store your card or bank details. Prices are in Indian Rupees and include any applicable taxes unless stated otherwise. Prices may change, but a change never affects something you have already paid for.</p>
    </>
  )],
  ["refunds", "6. Refunds and cancellations", (
    <>
      <p>Each invitation or card is a digital product made for you and delivered as soon as it is published, so a published purchase cannot be cancelled and is not normally refundable.</p>
      <p><b>You see the complete design before you pay.</b> Not liking the design, changing your mind, a cancelled or postponed event, or a mistake in details you entered after you have published are <b>not</b> reasons for a refund — you can still edit your invitation or card after publishing.</p>
      <p>We will refund you in full if:</p>
      <ul>
        <li>you were charged but your invitation or card was not published;</li>
        <li>you were charged more than once for the same item; or</li>
        <li>a fault on our side stops your invitation or card from working and we cannot fix it within a reasonable time.</li>
      </ul>
      <p>To ask for a refund, contact us through {contact} within 7 days of payment with your registered email and the payment ID from Razorpay. Approved refunds go back to the original payment method within 5–7 working days, depending on your bank.</p>
      <p>You can ask us to take down your invitation or card at any time; this does not by itself entitle you to a refund.</p>
    </>
  )],
  ["availability", "7. Availability", (
    <>
      <p>We work to keep Welcvm and your links available, but we cannot promise the site will always be uninterrupted or error-free, for example during maintenance or outages of the services we rely on. Invitations and cards may be archived some time after the event or occasion has passed.</p>
    </>
  )],
  ["ip", "8. Our designs and the site", (
    <>
      <p>The Welcvm name, logo, templates, artwork, animations and code belong to us or our licensors. You may share your own invitations and cards freely, but you may not copy, resell or reuse our designs or the site itself outside Welcvm.</p>
    </>
  )],
  ["liability", "9. Liability", (
    <>
      <p>Welcvm is provided &ldquo;as is&rdquo;. Please check the details on your invitation (names, dates, times, venues) before you share it — we are not responsible for mistakes in information you entered. As far as the law allows, our total liability to you for any claim is limited to the amount you paid us for the item concerned. Nothing in these terms limits any rights you have under Indian consumer law.</p>
    </>
  )],
  ["privacy", "10. Your information and photos", (
    <>
      <p>Our <Link href="/privacy">Privacy Policy</Link> explains what we collect — including the photos you and your guests add — how it is stored and shared, how long we keep it, and how to have it removed. It forms part of these terms.</p>
    </>
  )],
  ["changes", "11. Changes to these terms", (
    <>
      <p>We may update these terms from time to time. The date at the top shows the latest version; continuing to use Welcvm after a change means you accept it.</p>
    </>
  )],
  ["law", "12. Governing law and contact", (
    <>
      <p>These terms are governed by the laws of India{OWNER.city ? <>, and the courts of {OWNER.city} have jurisdiction</> : null}. For any question, complaint or refund request, reach us through {contact}.</p>
      <p><b>{COMPANY.legalName}</b><br />{COMPANY.address}<br />Email: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></p>
    </>
  )],
];

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="legal">
        <div className="legal-in">
          <p className="legal-kicker">Legal</p>
          <h1>Terms &amp; Conditions</h1>
          <p className="legal-updated">Last updated {UPDATED}</p>

          <nav className="legal-toc" aria-label="On this page">
            {SECTIONS.map(([id, title]) => (
              <a key={id} href={`#${id}`}>{title.replace(/^\d+\.\s*/, "")}</a>
            ))}
          </nav>

          {SECTIONS.map(([id, title, body]) => (
            <section key={id} id={id}>
              <h2>{title}</h2>
              {body}
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
