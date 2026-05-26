"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { HeroAnalyzerForm } from "../analyzer/hero-analyzer-form";
import { HeroLiveTicker } from "./hero-live-ticker";

// Engine logos shown inline in the subtitle. `title` doubles as the
// tooltip + accessibility label (screen readers will read it).
// Cycled one-at-a-time through every AI engine we have a logo for.
const SUBTITLE_ENGINES = [
  { name: "ChatGPT", src: "/logos/chatgpt.svg" },
  { name: "Perplexity", src: "/logos/perplexity.svg" },
  { name: "Gemini", src: "/logos/gemini.svg" },
  { name: "Claude", src: "/logos/claude.svg" },
  { name: "Copilot", src: "/logos/copilot.svg" },
  { name: "Google AI", src: "/logos/google.svg" },
] as const;

// Page-load entrance: badge first, then each headline word reveals in
// sequence with a blur-to-sharp transition, followed by subtitle / form /
// trust strip. No translateY on words (causes subpixel blur on text);
// blur filter cleanly resolves to 0 so text stays crisp post-animation.
const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.16,
      delayChildren: 0.1,
    },
  },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, filter: "blur(14px)" },
  show: {
    opacity: 1,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
export function LandingHero() {
  const [engineIdx, setEngineIdx] = useState(0);

  // Rotate the engine logo every 5s. Single logo visible at a time so the
  // chip stays compact (no horizontal space taken by neighbouring icons).
  useEffect(() => {
    const id = setInterval(() => setEngineIdx((i) => (i + 1) % SUBTITLE_ENGINES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const currentEngine = SUBTITLE_ENGINES[engineIdx];

  return (
    <section className="relative flex min-h-[calc(100vh-72px)] flex-col justify-center overflow-hidden bg-white px-6 py-12 lg:px-12 lg:py-16">
      {/* Animated film-grain noise overlay — replaces the gradient mesh
          on this section. Subtle motion every 16s, ~6% opacity. */}
      <div aria-hidden className="hero-noise" />

      {/* Top hairline accent — ties the section to the page chrome above. */}
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
