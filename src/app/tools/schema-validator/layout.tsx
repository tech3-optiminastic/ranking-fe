import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free Schema.org Validator — JSON-LD Coverage & AI Citation Check",
  description:
    "Scan any URL for Organization, Product, Article, FAQ, HowTo, BreadcrumbList, and 15 other JSON-LD types. Signalor flags missing required fields, partial definitions, and duplicate blocks that reduce AI citation chances. Free, no account needed.",
  path: "/tools/schema-validator",
  keywords: [
    "Schema.org validator",
    "JSON-LD validator",
    "free schema checker",
    "Organization schema validator",
    "Product schema checker",
    "Article JSON-LD validator",
    "FAQ schema checker",
    "HowTo schema validator",
    "BreadcrumbList schema",
    "structured data AI",
    "schema for AI citations",
    "JSON-LD missing fields",
    "schema coverage audit",
    "AI structured data checker",
    "free JSON-LD tool",
  ],
});

const FAQ = [
  {
    question: "Which Schema.org types are validated?",
    answer:
      "The validator checks 18 types including Organization, Product, Article, FAQPage, HowTo, BreadcrumbList, Event, Review, AggregateRating, LocalBusiness, Person, WebPage, WebSite, SoftwareApplication, Course, JobPosting, Recipe, and VideoObject — covering the schema types most relevant to AI citation eligibility.",
  },
  {
    question: "What counts as a partial or malformed schema?",
    answer:
      "A partial schema is missing required fields that AI engines expect — for example, an Organization block without a 'url' or 'name', or a Product without 'offers'. Malformed schemas have syntax errors or conflicting duplicate blocks that cause language models to ignore or mis-parse the structured data.",
  },
  {
    question: "Why does JSON-LD matter for AI citations?",
    answer:
      "Generative engines like ChatGPT, Gemini, and Perplexity use structured data to understand entities, verify facts, and establish authority before citing a page. Complete, valid JSON-LD helps language models identify who you are, what you offer, and why you are credible — all inputs that influence citation decisions.",
  },
  {
    question: "Can I validate multiple pages at once?",
    answer:
      "The free tool scans one URL at a time. Signing up or upgrading unlocks site-wide coverage roll-ups that show schema consistency across every template, plus ready-to-paste JSON-LD fix snippets ranked by GEO score impact.",
  },
];

const schemaValidatorJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Signalor Schema Validator",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/tools/schema-validator`,
  description:
    "Free Schema.org JSON-LD validator. Checks Organization, Product, Article, FAQ, HowTo, BreadcrumbList, and 12 more types for completeness, required fields, and duplicate blocks that reduce AI citation rates.",
  featureList: [
    "18 Schema.org type coverage",
    "Required field detection with property-level flags",
    "Duplicate and conflicting JSON-LD block detection",
    "GEO score impact ranking per finding",
    "Site-wide coverage rollup (Pro)",
    "Ready-to-paste fix snippets (Pro)",
  ],
};

export default function SchemaValidatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-schema-validator-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Free Tools", path: "/tools/schema-validator" },
          { name: "Schema Validator", path: "/tools/schema-validator" },
        ])}
      />
      <JsonLd id="ld-schema-validator-tool" data={schemaValidatorJsonLd} />
      <JsonLd id="ld-schema-validator-faq" data={faqJsonLd(FAQ)} />
      {children}
    </>
  );
}
