import type { Metadata } from "next";

import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { PromptTrackingFeaturesGrid } from "@/components/landing/prompt-tracking-features-grid";
import { PromptTrackingHero } from "@/components/landing/prompt-tracking-hero";
import { PromptTrackingWhySection } from "@/components/landing/prompt-tracking-why-section";
import {
  PROMPT_TRACKING_HUB_FAQ,
  PROMPT_TRACKING_SITE,
} from "@/lib/landing-prompt-tracking-content";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata, faqJsonLd } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: PROMPT_TRACKING_SITE.title,
  description: PROMPT_TRACKING_SITE.description,
  path: "/prompt-tracking",
});

export default function PromptTrackingPage() {
  return (
    <LandingMarketingShell>
      <p className="sr-only">
        Signalor Prompt Tracking lets marketing teams, SEO strategists, and brand managers monitor
        which user prompts trigger AI citations of their brand across ChatGPT, Claude, Gemini,
        Perplexity, and Google AI Overviews. You define branded queries, category questions,
        head-to-head comparisons, and buying-intent prompts, and Signalor runs live probes on a
        configurable schedule — recording every AI-generated response, paraphrase, direct citation,
        and omission. The prompt library organizes tracked queries by topic, campaign, or funnel
        stage so teams can spot which content gaps cost AI visibility before competitors exploit
        them. AI surfaces reporting gives a per-engine breakdown: which prompts rank on ChatGPT but
        not Gemini, where Perplexity cites a rival instead, and how mention tone shifts over time.
        Prompt Tracking integrates with Signalor GEO scoring so every drop in citation rate maps to
        a schema, content, or trust signal that can be actioned. It is the core generative engine
        optimization (GEO) and answer engine optimization (AEO) monitoring layer for brands
        competing in AI search.
      </p>
      <JsonLd
        id="ld-prompt-tracking-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Prompt tracking", path: "/prompt-tracking" },
        ])}
      />
      <JsonLd id="ld-prompt-tracking-faq" data={faqJsonLd([...PROMPT_TRACKING_HUB_FAQ])} />
      <PromptTrackingHero />
      <PromptTrackingFeaturesGrid />
      <PromptTrackingWhySection />
      <LandingFaq
        sectionId="prompt-tracking-faq"
        headingId="prompt-tracking-faq-heading"
        heading="Prompt tracking FAQs"
        description="How surfaces, libraries, and plans fit together inside Signalor."
        items={[...PROMPT_TRACKING_HUB_FAQ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}
