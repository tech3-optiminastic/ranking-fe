import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free GEO Score & AI Visibility Checker — URL Analyzer",
  description:
    "Paste any URL and get a free GEO score, schema audit, and top AI citation fixes — checked across ChatGPT, Claude, Gemini, Perplexity, and Google AI. No account required.",
  path: "/tools/url-analyzer",
  keywords: [
    "free GEO score",
    "AI visibility checker",
    "URL GEO audit",
    "free AI citation checker",
    "GEO analyzer tool",
    "Generative Engine Optimization audit",
    "AEO checker",
    "schema audit tool",
    "LLM readiness checker",
    "ChatGPT citation checker",
    "AI search visibility tool",
    "free SEO AI tool",
    "brand visibility score",
    "content AI audit",
    "llms.txt validator free",
  ],
});

const FAQ = [
  {
    question: "What does the GEO score measure?",
    answer:
      "The GEO score is a 0–100 composite that covers six pillars: Structure, Schema, Trust, Content, Citations, and Crawlability. Higher scores correlate with more frequent brand citations across ChatGPT, Claude, Gemini, and Perplexity.",
  },
  {
    question: "Which AI engines does the URL analyzer check?",
    answer:
      "The free summary checks schema, llms.txt, robots.txt AI-bot directives, and on-page trust signals. Upgrading adds live probes across ChatGPT, Claude, Gemini, and Perplexity so you see actual AI-generated summaries of your page.",
  },
  {
    question: "Is the URL analyzer really free?",
    answer:
      "Yes — you can run unlimited GEO audits on public URLs without creating an account. The free report shows the headline score, pillar breakdown, and top three fixes. Signing up unlocks the full fix queue, per-engine AI probes, and scheduled monitoring.",
  },
  {
    question: "How is a GEO audit different from a traditional SEO audit?",
    answer:
      "Traditional SEO audits optimize for Google rankings using crawlability, backlinks, and page speed. A GEO audit focuses on why AI engines like ChatGPT and Gemini choose to cite — or skip — a page: schema completeness, entity clarity, trust signals, and structured content that language models can extract and attribute.",
  },
];

const urlAnalyzerJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Signalor URL Analyzer",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/tools/url-analyzer`,
  description:
    "Free GEO and AEO score for any public URL. Reports schema coverage, llms.txt status, AI crawler permissions, trust signals, and citation patterns across ChatGPT, Claude, Gemini, Perplexity, and Google AI.",
  featureList: [
    "0–100 GEO score across six pillars",
    "Schema.org JSON-LD coverage audit",
    "llms.txt and robots.txt AI crawler check",
    "Per-engine citation signal analysis",
    "Prioritized fix list ranked by score impact",
  ],
};

export default function UrlAnalyzerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-url-analyzer-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Free Tools", path: "/tools/url-analyzer" },
          { name: "URL Analyzer", path: "/tools/url-analyzer" },
        ])}
      />
      <JsonLd id="ld-url-analyzer-tool" data={urlAnalyzerJsonLd} />
      <JsonLd id="ld-url-analyzer-faq" data={faqJsonLd(FAQ)} />
      {children}
    </>
  );
}
