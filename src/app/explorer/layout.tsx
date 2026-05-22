import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd, SITE_URL } from "@/lib/seo";
import { REPORTING_FAQ } from "@/lib/landing-reporting-content";

export const metadata: Metadata = buildMetadata({
  title: "GEO Explorer — AI Citation Analytics & Reporting",
  description:
    "Discover emerging AI prompts before competitors, track citation trends, and turn GEO scores into stakeholder-ready PDF and CSV reports. Signalor Explorer surfaces prompt gaps, competitor shifts, and the citations that move your brand.",
  path: "/explorer",
  keywords: [
    "GEO reporting",
    "AI visibility analytics",
    "AI citation analytics",
    "GEO analytics dashboard",
    "executive AI reports",
    "agency GEO reports",
    "AI search analytics",
    "prompt discovery tool",
    "citation trend tracking",
    "GEO PDF reports",
    "AI brand visibility reports",
    "competitor citation gaps",
    "Generative Engine Optimization reporting",
    "AI search monitoring",
    "prompt gap analysis",
  ],
});

const explorerWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${SITE_URL}/explorer`,
  name: "GEO Explorer — AI Citation Analytics & Reporting",
  description:
    "Discover emerging AI prompts, track citation trends, and export GEO reports. Signalor Explorer surfaces prompt gaps and competitor shifts before they impact brand visibility.",
  url: `${SITE_URL}/explorer`,
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Explorer", item: `${SITE_URL}/explorer` },
    ],
  },
  mainEntity: {
    "@type": "SoftwareApplication",
    name: "Signalor Explorer",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free GEO audit available" },
    featureList: [
      "Emerging AI prompt discovery before competitors",
      "Citation trend tracking across ChatGPT, Claude, Gemini, Perplexity",
      "Executive summary PDF exports",
      "White-label agency reports with client branding",
      "CSV row-level data for BI dashboards",
      "Weekly and monthly email digests",
    ],
  },
};

export default function ExplorerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-explorer-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Explorer", path: "/explorer" },
        ])}
      />
      <JsonLd id="ld-explorer-webpage" data={explorerWebPageJsonLd} />
      <JsonLd id="ld-explorer-faq" data={faqJsonLd([...REPORTING_FAQ])} />
      {children}
    </>
  );
}
