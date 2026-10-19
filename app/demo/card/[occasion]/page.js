import { notFound } from "next/navigation";
import CardDemo from "@/components/greetings/CardDemo";
import { CARD_DEMOS, cardDemo } from "@/lib/demo/cards";

/* /demo/card/<occasion> — a greeting card with invented names, already
   opened and turning its own pages. Embedded in the homepage's phone
   (components/HeroPhone.js, "Greeting cards" tab). */

export function generateStaticParams() {
  return CARD_DEMOS.map((d) => ({ occasion: d.occasion }));
}

export function generateMetadata({ params }) {
  const d = cardDemo(params.occasion);
  if (!d) return {};
  return {
    title: `${d.name} card — a Welcvm demo`,
    robots: { index: false, follow: true },
  };
}

export default function CardDemoPage({ params }) {
  const d = cardDemo(params.occasion);
  if (!d) notFound();
  return <CardDemo tokens={d.tokens} />;
}
