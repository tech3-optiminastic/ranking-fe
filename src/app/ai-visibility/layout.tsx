import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, SITE_URL } from "@/lib/seo";
import {
  CONTENT_SIGNALS_FAQ,
} from "@/lib/landing-content-signals-content";

export const metadata: Metadata = buildMetadata({
  title: "AI Visibility Scoring — Schema, Trust & Citation Signals",
  description:
    "Score how ChatGPT, Claude, Gemini, and Perplexity see your brand. Signalor audits schema coverage, trust markers, and content structure across every page so you know exactly what to fix to earn more AI citations.",
  path: "/ai-visibility",
  keywords: [
    "AI visibility",
    "GEO score",
    "content signals",
    "schema coverage audit",
    "trust signals AI",
    "citation optimization",
    "AEO audit",
    "AI search ranking",
    "structured data for AI",
    "LLM content grading",
    "Generative Engine Optimization",
    "JSON-LD schema",
    "AI citation signals",
    "brand visibility AI",
    "schema.org audit",
  ],
});

const aiVisibilityWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/ai-visibility`,
  name: "AI Visibility Scoring — Schema, Trust & Citation Signals",
  description:
    "Audit structure, schema, and trust markers across every page. Signalor scores how ChatGPT, Claude, Gemini, and Perplexity see and cite your brand.",
  url: `${SITE_URL}/ai-visibility`,
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "AI Visibility", item: `${SITE_URL}/ai-visibility` },
    ],
  },
  mainEntity: {
    "@type": "SoftwareApplication",
    name: "Signalor AI Visibility",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free GEO audit available" },
    featureList: [
      "Schema.org coverage audit across 18 types",
      "Trust signal scoring for authorship, citations, and credibility markers",
      "Per-engine AI visibility breakdown (ChatGPT, Claude, Gemini, Perplexity)",
      "Content structure analysis for generative engine citation readiness",
      "Prioritized fix queue with expected GEO score delta",
    ],
  },
};

export default function AiVisibilityLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-ai-visibility-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "AI Visibility", path: "/ai-visibility" },
        ])}
      />
      <JsonLd id="ld-ai-visibility-webpage" data={aiVisibilityWebPageJsonLd} />
      <JsonLd id="ld-ai-visibility-faq" data={faqJsonLd([...CONTENT_SIGNALS_FAQ])} />
      {children}
    </>
  );
}
