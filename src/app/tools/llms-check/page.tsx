"use client";

import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { ToolPage } from "@/components/tools/tool-page";
import { LlmsCheckInline } from "@/components/tools/llms-check-inline";

export default function LlmsCheckToolPage() {
  return (
    <LandingMarketingShell>
      <p className="sr-only">
        The Signalor LLM Checker is a free tool that diagnoses whether AI search engines can
        discover, access, and cite your website. It validates the presence and structure of your
        llms.txt manifest — the file that guides language models to your most important content. The
        checker parses robots.txt for AI bot directives covering GPTBot (ChatGPT / OpenAI),
        ClaudeBot (Anthropic Claude), PerplexityBot (Perplexity AI), Google-Extended (Gemini / AI
        Overviews), and OAI-SearchBot. It also verifies sitemap reachability and scans on-page
        signals including Organization schema, Article JSON-LD, canonical tags, and Open Graph
        metadata. Missing or blocking configurations silently prevent AI citations even when content
        quality is high. Results are instant with no account required. The full Signalor GEO audit
        adds live probes that show exactly how each AI engine describes and cites your brand.
      </p>
      <ToolPage
        theme="blue"
        eyebrow="[ free tool · llm checker ]"
        title="See if AI can find and cite"
        titleAccent="your site"
        description="Enter a domain and we'll check llms.txt, robots.txt AI-bot rules, sitemap, and on-page schema, an honest LLM-readiness score, free."
        secondaryDescription="The checker verifies your llms.txt manifest, parses robots.txt for GPTBot, ClaudeBot, PerplexityBot, and Google-Extended directives, confirms sitemap reachability, and scans on-page signals like Organization schema, canonical tags, and Open Graph metadata. Results are instant with no sign-up required."
        form={<LlmsCheckInline />}
        features={[
          {
            title: "llms.txt check",
            description:
              "Verifies whether you publish a llms.txt manifest and how many sections it exposes.",
          },
          {
            title: "AI crawler rules",
            description:
              "Parses robots.txt for GPTBot, ClaudeBot, PerplexityBot, Google-Extended, and more.",
          },
          {
            title: "On-page signals",
            description:
              "Title, description, Open Graph, canonical, Organization schema, sitemap reachability.",
          },
          { title: "Free forever", description: "Run unlimited checks without an account." },
        ]}
        previewEyebrow="[ what's inside the full report ]"
        previewTitle="Go beyond readiness ,"
        previewTitleAccent="real AI probes"
        previewDescription="The free tool shows crawlability and schema signals. Sign up or upgrade to run live probes across ChatGPT, Claude, Gemini, and Perplexity."
        previewRows={[
          { content: <PreviewOtherEngines />, locked: true },
          { content: <PreviewSentiment />, locked: true },
        ]}
      />
      <LandingFooter />
    </LandingMarketingShell>
  );
}

function PreviewOtherEngines() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Live AI probes · 4 engines</p>
      <p className="mt-1 text-xs text-muted-foreground">
        See how ChatGPT, Claude, Gemini, and Perplexity actually describe your brand, with
        paraphrase & citation tagging per line.
      </p>
    </div>
  );
}

function PreviewSentiment() {
  return (
    <div>
      <p className="text-sm font-semibold text-foreground">Sentiment + prompt trend</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Week-over-week sentiment delta and the prompts that drove the biggest shifts.
      </p>
    </div>
  );
}
