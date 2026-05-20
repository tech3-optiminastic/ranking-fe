"use client";

import { useState } from "react";
import { AiChip } from "@/components/ui/ai-chip";
import { HeroAnalyzerForm } from "../analyzer/hero-analyzer-form";
import { HeroBackgroundGrid } from "./hero-background-grid";

const SUGGESTION_CHIPS = [
  "How does ChatGPT describe my brand?",
  "Check my GEO score",
  "Find citation gaps",
  "Audit competitors",
  "Improve AI visibility",
];

export function LandingHero() {
  const [prefill, setPrefill] = useState("");

  return (
    <section className="relative bg-background px-6 pb-20 pt-24 lg:px-12 lg:pb-28 lg:pt-32">
      <HeroBackgroundGrid />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Title */}
        <h1 className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
          Be the brand{" "}
          <span className="inline-flex items-center gap-2 text-primary">
            <AiChip size="lg" />
            <span className="underline decoration-dashed decoration-2 decoration-primary/50 underline-offset-4">
              recommends
            </span>
          </span>
        </h1>

        {/* One-liner */}
        <p className="mx-auto mt-5 max-w-xl text-base font-light leading-relaxed text-muted-foreground lg:text-lg">
          Measure how AI engines describe your brand, find where competitors are winning citations,
          and ship fixes — all in one workflow.
        </p>

        {/* Search / analyzer form */}
        <div className="mt-8 flex justify-center">
          <div className="w-full max-w-2xl">
            <HeroAnalyzerForm initialUrl={prefill} key={prefill} />
          </div>
        </div>

        {/* Suggestion chips */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {SUGGESTION_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setPrefill("")}
              className="rounded-full border border-border bg-white px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
