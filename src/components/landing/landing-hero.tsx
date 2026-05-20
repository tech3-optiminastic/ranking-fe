"use client";

import { AiChip } from "@/components/ui/ai-chip";
import { HeroAnalyzerForm } from "../analyzer/hero-analyzer-form";
import { HeroBackgroundGrid } from "./hero-background-grid";

export function LandingHero() {
  return (
    <section className="relative bg-background px-6 pb-24 pt-28 lg:px-12 lg:pb-32 lg:pt-36">
      <HeroBackgroundGrid />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Be the brand{" "}
          <span className="inline-flex items-center gap-2 text-primary">
            <AiChip size="lg" />
            <span className="underline decoration-dashed decoration-2 decoration-primary/50 underline-offset-4">
              AI recommends
            </span>
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground lg:text-lg">
          Measure, optimize, and win AI citations — all in one workflow.
        </p>

        <div className="mt-10 flex justify-center">
          <HeroAnalyzerForm />
        </div>
      </div>
    </section>
  );
}
