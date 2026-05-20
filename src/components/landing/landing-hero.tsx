"use client";

import { HeroAnalyzerForm } from "../analyzer/hero-analyzer-form";
import { HeroBackgroundGrid } from "./hero-background-grid";

export function LandingHero() {
  return (
    <section className="relative bg-background px-6 pb-16 pt-20 lg:px-12 lg:pb-20 lg:pt-24">
      <HeroBackgroundGrid />

      {/* Soft primary glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-full"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 20%, rgba(224, 74, 61, 0.09) 0%, transparent 68%)",
        }}
      />

      {/* Secondary cooler accent for depth */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-full"
        style={{
          background:
            "radial-gradient(ellipse 45% 40% at 70% 60%, rgba(99, 102, 241, 0.04) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          AI Search Visibility Platform
        </div>

        <h1 className="text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Audit. <span className="text-primary">Optimize.</span> Win.
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-base text-muted-foreground lg:text-lg">
          Measure, optimize, and win AI citations — all in one workflow.
        </p>

        <div className="mt-10 flex justify-center">
          <HeroAnalyzerForm />
        </div>
      </div>
    </section>
  );
}
