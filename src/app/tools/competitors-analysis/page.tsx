"use client";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { ToolPage } from "@/components/tools/tool-page";
import { CompetitorsInline } from "@/components/tools/competitors-inline";

export default function CompetitorsAnalysisToolPage() {
  return (
    <LandingMarketingShell>
      <p className="sr-only">
        The Signalor Competitor Analysis tool reveals which brands AI engines recommend, compare, and cite alongside yours. It sources competitors from live Google autocomplete signals — the exact "vs", "alternatives to", and "compared to" phrases buyers type when researching your category. Results are ranked by co-mention frequency so you see which rivals appear most often in active purchase-decision queries. This AI competitor analysis goes beyond traditional backlink or keyword ranking tools: it maps the competitive landscape as generative engines like ChatGPT, Gemini, Perplexity, and Claude see it. Free, no sign-up required for the co-mention ranking. Upgrading adds per-engine AI citation breakdowns that show which competitors win on ChatGPT vs Gemini vs Perplexity — and the specific prompts where rivals are cited but you are not.
      </p>
      <ToolPage
        theme="emerald"
        eyebrow="[ free tool · competitors analysis ]"
        title="See who wins comparison queries in"
        titleAccent="your category"
        description="Paste your domain and we'll rank the brands people actually compare you against, pulled from live search autocomplete, not a mock list."
        secondaryDescription="Results are derived from real buyer queries — the 'vs', 'alternatives', and 'compared to' phrases your prospects type into Google and AI engines. Ranked by co-mention frequency so you immediately see which rivals appear most often alongside your brand. Free, no sign-up required."
        form={<CompetitorsInline />}
        features={[
          {
            title: "Real buyer queries",
            description:
              "Competitors pulled from live 'vs', 'alternatives', and 'compared to' autocomplete, the queries your buyers type.",
          },
          {
            title: "Co-mention ranking",
            description: "Ranked by how often each rival surfaces next to you in real searches.",
          },
          {
            title: "Expandable",
            description:
              "Sign up to benchmark against live AI citations across ChatGPT, Claude, Gemini, and Perplexity.",
          },
          {
            title: "Free forever",
            description: "Run unlimited checks on public brands without an account.",
          },
        ]}
        previewEyebrow="[ what's inside the full report ]"
        previewTitle="Go beyond search ,"
        previewTitleAccent="live AI benchmarks"
        previewDescription="The free tool shows search-autocomplete co-mentions. Sign up or upgrade to benchmark AI citations per engine, per prompt."
        previewRows={[
          { content: <PreviewEngineSplit />, locked: true },
          { content: <PreviewPromptGaps />, locked: true },
        ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}

function PreviewEngineSplit() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Per-engine breakdown</p>
      <p className="mt-1 text-xs text-muted-foreground">
        See who wins on ChatGPT, Claude, Gemini, and Perplexity separately, the engines rarely
        agree.
      </p>
    </div>
  );
}

function PreviewPromptGaps() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Prompt-level gaps</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Prompts where competitors are cited and you are not, ready to drop into a content brief.
      </p>
    </div>
  );
}
