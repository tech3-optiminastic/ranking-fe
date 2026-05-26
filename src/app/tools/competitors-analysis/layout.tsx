import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Free AI Competitor Analysis — Who Wins in Your Category",
  description:
    "See which brands AI engines recommend alongside yours. Paste your domain and Signalor ranks competitors by co-mention frequency in live 'vs', 'alternatives', and comparison queries — free, no sign-up.",
  path: "/tools/competitors-analysis",
  keywords: [
    "AI competitor analysis",
    "GEO competitor tracking",
    "AI search competitor tool",
    "brand co-mention analysis",
    "vs query analysis",
    "alternatives query tracker",
    "competitor citation analysis",
    "AI search share of voice",
    "ChatGPT competitor rankings",
    "AI category leader tracker",
    "competitor GEO audit",
    "brand comparison AI",
    "search autocomplete competitors",
    "LLM competitor mentions",
    "free competitor analysis tool",
  ],
});

const FAQ = [
  {
    question: "How are competitors identified?",
    answer:
      "Competitors are discovered from live Google autocomplete queries — the 'vs', 'alternatives to', and 'compared to' phrases real buyers type when evaluating your category. This gives you the rivals that matter in active purchase decisions, not a static CRM list.",
  },
  {
    question: "What is co-mention frequency?",
    answer:
      "Co-mention frequency is how often a competitor appears alongside your brand in buyer comparison searches. A rival that appears in 60% of your brand's comparison queries is a higher-priority target than one appearing in 10%.",
  },
  {
    question: "How is AI competitor analysis different from traditional SEO competitor tracking?",
    answer:
      "Traditional tools track keyword rankings and backlinks. AI competitor analysis tracks which brands generative engines like ChatGPT, Gemini, Perplexity, and Claude actually cite, recommend, and compare when buyers ask category questions — a fundamentally different signal set.",
  },
  {
    question: "Can I see per-engine AI citation breakdowns?",
    answer:
      "The free tool shows search-autocomplete co-mentions. Signing up or upgrading adds per-engine AI citation benchmarks — revealing which rivals win on ChatGPT vs. Gemini vs. Perplexity, since the engines frequently disagree on category leaders.",
  },
];

const competitorsToolJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Signalor Competitor Analysis",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: `${SITE_URL}/tools/competitors-analysis`,
  description:
    "Free AI competitor analysis. Ranks brands by co-mention frequency in live 'vs' and 'alternatives' autocomplete queries. Upgrade for per-engine AI citation benchmarks across ChatGPT, Claude, Gemini, and Perplexity.",
  featureList: [
    "Live competitor discovery from 'vs' and 'alternatives' search queries",
    "Co-mention frequency ranking",
    "Per-engine AI citation benchmarking (Pro)",
    "Prompt-level gap analysis showing where rivals are cited and you are not",
  ],
};

export default function CompetitorsAnalysisLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-competitors-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Free Tools", path: "/tools/competitors-analysis" },
          { name: "Competitor Analysis", path: "/tools/competitors-analysis" },
        ])}
      />
      <JsonLd id="ld-competitors-tool" data={competitorsToolJsonLd} />
      <JsonLd id="ld-competitors-faq" data={faqJsonLd(FAQ)} />
      {children}
    </>
  );
}
