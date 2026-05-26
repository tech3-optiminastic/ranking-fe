"use client";

import { LandingFaq } from "@/components/landing/landing-faq";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { PromptTrackingFeaturesGrid } from "@/components/landing/prompt-tracking-features-grid";
import { PromptTrackingHero } from "@/components/landing/prompt-tracking-hero";
import { PromptTrackingWhySection } from "@/components/landing/prompt-tracking-why-section";
import {
  INTEGRATIONS_CAPABILITY_ROWS,
  INTEGRATIONS_FAQ,
  INTEGRATIONS_FEATURES_FOOTER_CTAS,
  INTEGRATIONS_FEATURES_INTRO,
  INTEGRATIONS_FEATURE_CELLS,
  INTEGRATIONS_HERO,
  INTEGRATIONS_HUB_CARDS,
  INTEGRATIONS_PILLAR_ROWS,
  INTEGRATIONS_PROOF_METRICS,
  INTEGRATIONS_WHY,
} from "@/lib/landing-integrations-feature-content";

export default function IntegrationsFeaturePage() {
  return (
    <LandingMarketingShell>
      <p className="sr-only">
        Signalor Recommendations delivers a prioritized GEO fix queue that maps every schema gap,
        content structure issue, and trust signal weakness to an expected citation lift. Fixes are
        ranked by projected GEO score delta so engineering, SEO, and content teams work the
        highest-impact items first. For Shopify stores and WordPress sites, approved fixes publish
        directly to the live CMS — no developer handoff required. The Signalor Shopify app applies
        product schema, meta updates, and llms.txt changes in one click. The WordPress GEO plugin
        writes structured data, canonical tags, and robots directives to pages and posts without
        touching theme files. Analytics bridging reads GA4 and Google Search Console so citation
        improvements tie to traffic, revenue, and assisted conversions. The fix queue supports
        webhook delivery and a typed REST API for teams routing GEO tasks into Jira, Linear, or
        custom pipelines.
      </p>
      <PromptTrackingHero hero={INTEGRATIONS_HERO} cards={INTEGRATIONS_HUB_CARDS} />
      <PromptTrackingFeaturesGrid
        intro={INTEGRATIONS_FEATURES_INTRO}
        cells={INTEGRATIONS_FEATURE_CELLS}
        footerCtas={INTEGRATIONS_FEATURES_FOOTER_CTAS}
        headingId="recommendations-features-heading"
        theme="emerald"
      />
      <PromptTrackingWhySection
        content={INTEGRATIONS_WHY}
        proofMetrics={INTEGRATIONS_PROOF_METRICS}
        pillarRows={INTEGRATIONS_PILLAR_ROWS}
        capabilityRows={INTEGRATIONS_CAPABILITY_ROWS}
        primaryCta={INTEGRATIONS_HERO.primaryCta}
        secondaryCtaLabel="Browse integrations"
        secondaryCtaHref="/integration"
        headingId="integrations-why-heading"
      />
      <LandingFaq
        sectionId="integrations-faq"
        headingId="integrations-faq-heading"
        heading="Integration FAQs"
        description="How Signalor connects to the tools your team already uses."
        items={[...INTEGRATIONS_FAQ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}
