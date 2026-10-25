import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { COMPANY } from "@/lib/company";

/* ══════════════════════════════════════════════════════════════════════
   /privacy — the Privacy Policy. Written for a site where people upload
   personal photographs (their own, their families', sometimes children's)
   and share them by link, under India's Digital Personal Data Protection
   Act, 2023. A sensible default, NOT legal advice — have it reviewed.
   Company details: lib/company.js.
   ══════════════════════════════════════════════════════════════════════ */

const UPDATED = "25 October 2026";

export const metadata = {
  title: "Privacy Policy — Welcvm",
  description: "How Welcvm collects, stores and protects your information and the photos you share in invitations and greeting cards.",
};

const mail = <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>;

const SECTIONS = [
  ["who", "1. Who we are", (
    <p>Welcvm (welcvm.com) is run by <b>{COMPANY.legalName}</b>, {COMPANY.address} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). We are responsible for the personal information described here. Questions or requests: {mail}.</p>
  )],
  ["collect", "2. What we collect", (
    <>
      <ul>
        <li><b>Your account:</b> name, email address and password (stored encrypted by our login provider — we never see it).</li>
        <li><b>What you put in an invitation or card:</b> names, dates, venues, messages, and the <b>photos and music</b> you upload.</li>
        <li><b>Guests:</b> the replies guests give when they RSVP (name, number of people, phone number if asked) and anything they add to the invitation, such as blessings or photos.</li>
        <li><b>Payments:</b> the amount, status and payment ID from Razorpay. We never see or store your card, UPI or bank details.</li>
        <li><b>Technical data:</b> basic logs such as browser type and IP address, kept by our hosting provider for security and to fix faults.</li>
      </ul>
    </>
  )],
  ["photos", "3. Your photos", (
    <>
      <p>Photos are personal, so we treat them carefully:</p>
      <ul>
        <li><b>Who can see them.</b> Photos in an invitation or card can be seen by anyone who has its link. They are not listed publicly and invitation and card pages are marked so search engines do not index them. Share your link only with the people you mean to.</li>
        <li><b>Where they are stored.</b> On secure cloud storage run by our database provider, under a long, random web address. Anyone who has that address can open the file, so treat it like the link itself.</li>
        <li><b>What we do with them.</b> Only show them in your invitation or card. We do <b>not</b> sell your photos, use them in advertising, or show them anywhere else on Welcvm without your permission.</li>
        <li><b>Other people in your photos.</b> Upload photos of other people only with their permission, and photos of children only with a parent&rsquo;s or guardian&rsquo;s consent.</li>
        <li><b>Taking a photo down.</b> You can remove or replace photos while editing. Anyone — including a person who appears in a photo — can ask us to remove it by writing to {mail}; we act on such requests as quickly as we reasonably can.</li>
      </ul>
    </>
  )],
  ["use", "4. How we use your information", (
    <ul>
      <li>To create, host and share your invitations and cards, and to show you guests&rsquo; RSVPs.</li>
      <li>To design your invitation: the text you type in the chat is sent to our AI provider to write and lay out the design.</li>
      <li>To take payments and handle refunds.</li>
      <li>To keep the service secure, fix problems and answer your messages.</li>
    </ul>
  )],
  ["share", "5. Who we share it with", (
    <>
      <p>We never sell your personal information. We share it only with the companies that run parts of Welcvm for us, and only as much as they need:</p>
      <ul>
        <li><b>Supabase</b> — database, login and photo/music storage;</li>
        <li><b>Vercel</b> — website hosting;</li>
        <li><b>Razorpay</b> — payments;</li>
        <li><b>our AI provider</b> (such as Google) — to turn your chat into a design.</li>
      </ul>
      <p>Some of these services may store data outside India. We may also disclose information if the law requires it.</p>
    </>
  )],
  ["keep", "6. How long we keep it", (
    <p>We keep your account and your invitations and cards for as long as your account is open, so your links keep working. Payment records are kept as long as tax and accounting law requires. When you ask us to delete your account, we delete your invitations, cards, photos and music within 30 days, apart from records we must keep by law.</p>
  )],
  ["rights", "7. Your rights", (
    <p>Under India&rsquo;s Digital Personal Data Protection Act, 2023 you can ask us to show you, correct, or delete the personal information we hold about you, and withdraw consent you have given. Write to {mail} from your registered email address. If you are not satisfied with our reply, you may complain to the Data Protection Board of India.</p>
  )],
  ["security", "8. Security", (
    <p>Data is sent over encrypted connections (HTTPS), and access to our systems is limited. No service can promise perfect security, but if we learn of a breach that affects you, we will tell you and the authorities as the law requires.</p>
  )],
  ["children", "9. Children", (
    <p>Welcvm is for adults. Children&rsquo;s photos — at a naming ceremony or a birthday, say — may appear in invitations only when a parent or guardian adds them or agrees.</p>
  )],
  ["changes", "10. Changes", (
    <p>We may update this policy; the date at the top shows the latest version. Significant changes will be shown on the site.</p>
  )],
  ["contact", "11. Contact and grievances", (
    <>
      <p>For privacy questions, data requests or complaints, contact our grievance officer:</p>
      <p><b>{COMPANY.legalName}</b><br />{COMPANY.address}<br />Email: {mail}</p>
      <p>See also our <Link href="/terms">Terms &amp; Conditions</Link>.</p>
    </>
  )],
];

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="legal">
        <div className="legal-in">
          <p className="legal-kicker">Legal</p>
          <h1>Privacy Policy</h1>
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
