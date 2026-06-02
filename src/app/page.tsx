import type { Metadata } from "next";
import { LandingFeaturesGrid } from "@/components/landing/landing-features-grid";
import { LandingWhySignalor } from "@/components/landing/landing-why-signalor";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingTestimonials } from "@/components/landing/landing-testimonials";
import { LandingIntegrationsStrip } from "@/components/landing/landing-integrations-strip";
import { LandingPricingTeaser } from "@/components/landing/landing-pricing-teaser";
import { LandingNewsletter } from "@/components/landing/landing-newsletter";
import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingPartnersProgram } from "@/components/landing/landing-partners-program";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { JsonLd } from "@/components/seo/json-ld";
import {
  AGGREGATE_RATING,
  breadcrumbJsonLd,
  buildMetadata,
  faqJsonLd,
  siteNavigationJsonLd,
  SITE_BRAND,
  SITE_URL,
} from "@/lib/seo";

const HOMEPAGE_FAQ = [
  {
    question: "What is Generative Engine Optimization (GEO)?",
    answer:
      "GEO is the practice of optimizing a website so AI engines like ChatGPT, Claude, Gemini, and Perplexity understand it, trust it, and cite it in their answers. Signalor scores GEO across six pillars: content, schema, E-E-A-T, technical, entity, and AI visibility.",
  },
  {
    question: "What is the difference between SEO and GEO?",
    answer:
      "SEO targets the ten blue links on a search results page. GEO targets the answer text an AI generates. GEO needs answer-shaped content, complete Schema.org markup, and strong trust signals so the model will cite you. Both still matter — the tactics differ.",
  },
  {
    question: "Which AI engines does Signalor track?",
    answer:
      "ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google), Perplexity, Google AI Overviews, and Microsoft Copilot. Engine coverage varies by plan. The Max plan includes all engines.",
  },
  {
    question: "How do I get started with Signalor?",
    answer:
      "Paste any public URL into the free analyzer at signalor.ai. You'll get a GEO score, citation signals, and a prioritized fix list — no install required. Create an account to save runs and track changes over time.",
  },
  {
    question: "How does Signalor score a website?",
    answer:
      "Six weighted pillars: content (0.20), schema (0.15), E-E-A-T (0.20), technical (0.15), entity (0.15), and AI visibility (0.15). Each pillar rolls 5–15 sub-checks into a 0–100 score. The weighted average is your final GEO score, with prioritized fixes attached to each pillar.",
  },
  {
    question: "Does Signalor work with Shopify and WordPress?",
    answer:
      "Yes. Our Shopify app scores product and content pages. Our WordPress plugin (signalor-geo) surfaces recommendations and applies one-click schema fixes inside wp-admin.",
  },
];

export const metadata: Metadata = buildMetadata({
  title: undefined,
  // Plain-English meta. Front-loads the keywords most likely to appear in
  // a query ("ChatGPT / AI engines / cite") and ends on the action.
  description:
    "See how ChatGPT, Claude, Gemini, and Perplexity cite your brand. Get a free GEO score and a fix list. Paste any URL to start.",
  path: "/",
});

export default function Home() {
  const breadcrumbs = breadcrumbJsonLd([{ name: "Home", path: "/" }]);
  const faq = faqJsonLd(HOMEPAGE_FAQ);
  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: SITE_BRAND,
    description:
      "GEO and AEO platform that scores how AI engines cite your brand and ships prioritized fixes.",
    brand: { "@type": "Brand", name: "Signalor" },
    url: SITE_URL,
    image: `${SITE_URL}/icon.svg`,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "GBP",
      lowPrice: "19.99",
      highPrice: "59.99",
      offerCount: 3,
      url: `${SITE_URL}/pricing`,
    },
    aggregateRating: AGGREGATE_RATING,
  };

  return (
    <LandingMarketingShell>
      <JsonLd id="ld-home-breadcrumb" data={breadcrumbs} />
      <JsonLd id="ld-home-faq" data={faq} />
      <JsonLd id="ld-home-product" data={product} />
      <JsonLd id="ld-home-sitenav" data={siteNavigationJsonLd()} />

      <LandingHero />

      <LandingIntegrationsStrip />

      <LandingHowItWorks />
      <LandingFeaturesGrid />
      <LandingTestimonials />
      <LandingWhySignalor />
      <LandingPricingTeaser />
      <LandingFaq items={HOMEPAGE_FAQ} />
      <LandingPartnersProgram />
      <LandingNewsletter />
      <LandingFooter />
    </LandingMarketingShell>
  );
}
