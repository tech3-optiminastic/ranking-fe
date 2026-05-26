import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free llms.txt Checker & LLM Readiness Score",
  description:
    "Check your llms.txt manifest, robots.txt AI crawler rules (GPTBot, ClaudeBot, PerplexityBot, Google-Extended), sitemap, and on-page schema in seconds. Free LLM readiness score — no sign-up.",
  path: "/tools/llms-check",
  keywords: [
    "llms.txt checker",
    "LLM readiness checker",
    "GPTBot robots.txt",
    "ClaudeBot checker",
    "PerplexityBot rules",
    "Google-Extended checker",
    "AI crawler checker",
    "llms.txt validator",
    "AI bot access checker",
    "LLM crawlability",
    "AI search readiness",
    "robots.txt AI directives",
    "sitemap AI checker",
    "schema.org validator free",
    "free AI readiness tool",
  ],
});

const FAQ = [
  {
    question: "What is llms.txt and why does it matter?",
    answer:
      "llms.txt is a plain-text manifest that tells AI models which pages contain your most important content, similar to how robots.txt guides search crawlers. Publishing a well-structured llms.txt helps ChatGPT, Claude, and other language models locate your best content faster and increases the chance of accurate citations.",
  },
  {
    question: "Which AI crawlers are checked in robots.txt?",
    answer:
      "The checker parses robots.txt for GPTBot (ChatGPT), ClaudeBot (Claude / Anthropic), PerplexityBot (Perplexity), Google-Extended (Google AI Overviews / Gemini), OAI-SearchBot, and other known LLM user-agent strings. Blocked crawlers can silently prevent AI citations even when your content is excellent.",
  },
  {
    question: "What on-page signals does the LLM checker verify?",
    answer:
      "The checker scans for Organization schema, Article schema, canonical tags, Open Graph metadata, title and meta description presence, sitemap reachability, and HTTPS enforcement — the signals AI systems rely on to establish trust before citing a page.",
  },
  {
    question: "Does passing the LLM check guarantee AI citations?",
    answer:
      "It removes the technical blockers that silently prevent AI engines from reading and citing your content. Earning citations also requires strong content quality, topical authority, and clear entity definitions — all areas Signalor's full GEO audit covers.",
  },
];

const llmsCheckJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Signalor llms.txt Checker",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/tools/llms-check`,
  description:
    "Free llms.txt validator and LLM readiness checker. Verifies the llms.txt manifest, AI crawler rules in robots.txt (GPTBot, ClaudeBot, PerplexityBot, Google-Extended), sitemap presence, and on-page schema signals.",
  featureList: [
    "llms.txt presence and structure check",
    "robots.txt AI bot directive parser (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)",
    "Sitemap reachability verification",
    "On-page Organization and Article schema detection",
    "Open Graph and canonical tag validation",
  ],
};

export default function LlmsCheckLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-llms-check-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Free Tools", path: "/tools/llms-check" },
          { name: "llms.txt Checker", path: "/tools/llms-check" },
        ])}
      />
      <JsonLd id="ld-llms-check-tool" data={llmsCheckJsonLd} />
      <JsonLd id="ld-llms-check-faq" data={faqJsonLd(FAQ)} />
      {children}
    </>
  );
}
