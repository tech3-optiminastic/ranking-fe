"use client";

import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { HeroAnalyzerForm } from "../analyzer/hero-analyzer-form";
import { Sparkles, Zap, Eye, BarChart3 } from "@/components/icons";

// Engine logos shown inline in the subtitle. `title` doubles as the
// tooltip + accessibility label (screen readers will read it).
const SUBTITLE_ENGINES = [
  { name: "ChatGPT", src: "/logos/chatgpt.svg" },
  { name: "Claude", src: "/logos/claude.svg" },
  { name: "Gemini", src: "/logos/gemini.svg" },
  { name: "Perplexity", src: "/logos/perplexity.svg" },
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
  return (
    <section className="relative flex min-h-[92vh] flex-col justify-end overflow-hidden px-6 pb-16 pt-32 lg:px-12 lg:pb-24 lg:pt-40">
      {/* Top hairline accent — ties the section to the page chrome above. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(224, 74, 61, 0.35) 50%, transparent 100%)",
        }}
      />

      <motion.div
        className="relative z-10 mx-auto max-w-3xl text-center"
        initial="hidden"
        animate="show"
        variants={containerVariants}
      >
        {/* Status badge with sparkle icon + animated pulse */}
        <motion.div
          variants={fadeUpVariants}
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-white/70 px-3.5 py-1.5 text-xs font-medium text-primary shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm"
        >
          <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
          <span>AI Search Visibility Platform</span>
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
        </motion.div>

        <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          <motion.span variants={wordVariants} className="inline-block will-change-[filter]">
            Audit.
          </motion.span>{" "}
          <motion.span
            variants={wordVariants}
            className="relative inline-block text-primary will-change-[filter]"
          >
            Optimize.
            <span
              aria-hidden
              className="absolute inset-x-1 -bottom-1 h-[3px] rounded-full"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(224, 74, 61, 0.55) 30%, rgba(224, 74, 61, 0.55) 70%, transparent 100%)",
              }}
            />
          </motion.span>{" "}
          <motion.span variants={wordVariants} className="inline-block will-change-[filter]">
            Win.
          </motion.span>
        </h1>

        <motion.p
          variants={fadeUpVariants}
          className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-2 text-base leading-relaxed text-muted-foreground lg:text-lg"
        >
          <span>See how</span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-white px-2 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {SUBTITLE_ENGINES.map((engine) => (
              <Image
                key={engine.name}
                src={engine.src}
                alt={engine.name}
                title={engine.name}
                width={18}
                height={18}
                className="h-[18px] w-[18px] object-contain"
              />
            ))}
          </span>
          <span>describe your brand. Find what to fix. Ship it.</span>
        </motion.p>

        <motion.div variants={fadeUpVariants} className="mt-10 flex justify-center">
          <HeroAnalyzerForm />
        </motion.div>

        {/* Trust strip — three lightweight signals that build confidence
            without leaning on testimonial logos we don't yet have. */}
        <motion.div
          variants={fadeUpVariants}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-primary/70" strokeWidth={2} aria-hidden />
            Instant analysis
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:inline-block" />
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-primary/70" strokeWidth={2} aria-hidden />6 AI engines
            tracked
          </span>
          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:inline-block" />
          <span className="inline-flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-primary/70" strokeWidth={2} aria-hidden />
            Free for the first scan
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
