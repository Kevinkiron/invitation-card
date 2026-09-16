import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import TemplateRenderer from "@/components/TemplateRenderer";
import { DEMOS, demoBySlug } from "@/lib/demo/fixtures";
import DemoAutoScroll from "@/components/DemoAutoScroll";
import "@/app/demo.css";

/* ══════════════════════════════════════════════════════════════════════
   /demo/<slug> — a real invitation, with invented names.

   Two audiences reach this page:

     a visitor, who followed a preview on the landing page and wants to
     scroll the whole thing on their own phone; and

     the landing page itself, which embeds this route in an iframe with
     `?embed=1` to show it moving inside a phone frame.

   The embed variant drops the banner and the footer CTA — a chrome bar
   inside a 250px-wide phone mockup is unreadable — and scrolls itself.
   Everything else is identical, because the value of this page is that
   it is not a mockup.
   ══════════════════════════════════════════════════════════════════════ */

/* NOT force-static. This page reads `searchParams.embed` to decide
   whether to render the compact, already-open iframe view or the full
   page with its banner and footer — and a `force-static` page is
   rendered once at build time with no query string at all, so every
   request to it (with or without `?embed=1`) was serving the exact same
   pre-built full page. That's why every phone preview — the hero and the
   "See it built" cards alike — showed the full page (banner, footer, and
   the real "Tap to open" gate) scaled into a tiny box instead of the
   clean, already-opened embed: `embed` was never `true` in what actually
   got served. Dropping `force-static` lets Next.js render this route
   per-request, the way anything that reads `searchParams` needs to.
   `generateStaticParams` below still tells Next which slugs exist. */

export function generateStaticParams() {
  return DEMOS.map((d) => ({ slug: d.slug }));
}

export function generateMetadata({ params }) {
  const demo = demoBySlug(params.slug);
  if (!demo) return {};
  return {
    title: `${demo.label} invitation — a Welcvm demo`,
    description: `${demo.blurb} A demonstration invitation; the names and the event are invented.`,
    /* A demo should never outrank the real pages, and a search result
       for "Meera and Rohan wedding" pointing at a fictional couple helps
       nobody. */
    robots: { index: false, follow: true },
  };
}

export default function DemoPage({ params, searchParams }) {
  const demo = demoBySlug(params.slug);
  if (!demo) notFound();

  const embed = searchParams?.embed === "1";

  if (embed) {
    return (
      <div className="demo-embed">
        <DemoAutoScroll />
        {/* `compact` is what WeddingCinema/CelebrationCinema read as
            `preview` — it starts the invitation already open and hides
            the chapter chip and music toggle. Real guests need "Tap to
            open" because a browser will only allow audio-with-sound to
            start from an actual tap; nobody can tap a phone mockup
            sitting inside another page, so leaving that gate on here
            just showed every embedded preview frozen on its opening
            screen forever, DemoAutoScroll included — there was nothing
            open yet for it to scroll through. */}
        <TemplateRenderer cfg={demo.cfg} compact />
      </div>
    );
  }

  return (
    <div className="demo-page">
      {/* Said plainly and said first. These are invented people, and a
          visitor who cannot tell a demonstration from a customer's real
          invitation has been misled, however pretty the page is. */}
      <div className="demo-banner">
        <div className="demo-banner-in">
          <p>
            <strong>This is a demonstration.</strong> The names, the dates and the
            event are invented — the invitation itself is the real thing, built by
            Welcvm.
          </p>
          <Link href="/create" className="demo-banner-cta">
            Make yours <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <TemplateRenderer cfg={demo.cfg} />

      <div className="demo-foot">
        <p className="demo-foot-kicker">{demo.label}</p>
        <h2 className="demo-foot-h">Yours would not look like this one.</h2>
        <p className="demo-foot-p">
          Every invitation is designed around what you tell us — your names, your
          functions, your photographs. This one belongs to people who do not exist.
        </p>
        <Link href="/create" className="demo-foot-cta">
          Create your invitation <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <nav className="demo-others" aria-label="Other demonstrations">
          {DEMOS.filter((d) => d.slug !== demo.slug).map((d) => (
            <Link key={d.slug} href={d.href} style={{ "--demo-accent": d.accent }}>
              {d.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
