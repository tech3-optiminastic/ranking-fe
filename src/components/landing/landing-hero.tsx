"use client";

import { HeroAnalyzerForm } from "../analyzer/hero-analyzer-form";
import { HeroBackgroundGrid } from "./hero-background-grid";

export function LandingHero() {
  return (
    <section className="relative bg-background px-6 pb-24 pt-28 lg:px-12 lg:pb-32 lg:pt-36">
      <HeroBackgroundGrid />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Audit. <span className="text-primary">Optimize.</span> Win.
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
