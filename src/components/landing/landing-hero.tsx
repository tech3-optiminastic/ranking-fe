"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { HeroAnalyzerForm } from "../analyzer/hero-analyzer-form";
import { HeroLiveTicker } from "./hero-live-ticker";

const SUBTITLE_ENGINES = [
  { name: "ChatGPT", src: "/logos/chatgpt.svg" },
  { name: "Perplexity", src: "/logos/perplexity.svg" },
  { name: "Gemini", src: "/logos/gemini.svg" },
  { name: "Claude", src: "/logos/claude.svg" },
  { name: "Copilot", src: "/logos/copilot.svg" },
  { name: "Google AI", src: "/logos/google.svg" },
] as const;

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

  useEffect(() => {
    const id = setInterval(() => setEngineIdx((i) => (i + 1) % SUBTITLE_ENGINES.length), 5000);
    return () => clearInterval(id);
  }, []);

  const currentEngine = SUBTITLE_ENGINES[engineIdx];

  return (
    <section className="relative flex min-h-[calc(100vh-72px)] flex-col justify-center overflow-hidden bg-white px-6 py-12 lg:px-12 lg:py-16">
      {/* Animated film-grain noise overlay */}
      <div aria-hidden className="hero-noise" />

      {/* Top hairline accent */}
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
        <motion.div variants={fadeUpVariants} className="mb-7 flex justify-center">
          <HeroLiveTicker />
        </motion.div>

        <motion.p
          variants={fadeUpVariants}
          className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500"
        >
          [ ai search visibility ]
        </motion.p>

        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-[2.65rem] md:leading-[1.05] lg:text-5xl">
          <motion.span variants={wordVariants} className="inline-block will-change-[filter]">
            Audit your site in{" "}
            <span className="underline decoration-primary decoration-dashed decoration-2 underline-offset-[6px]">
              60 seconds
            </span>
            .
          </motion.span>{" "}
          <motion.span variants={wordVariants} className="inline-block will-change-[filter]">
            Be cited by{" "}
            <span className="underline decoration-primary decoration-dashed decoration-2 underline-offset-[6px]">
              every AI engine
            </span>
            .
          </motion.span>
        </h1>

        <motion.p
          variants={fadeUpVariants}
          className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-2 text-base leading-relaxed text-muted-foreground lg:text-lg"
        >
          <span>Be the brand</span>
          <span className="relative inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-black/8 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentEngine.name}
                initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 20 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Image
                  src={currentEngine.src}
                  alt={currentEngine.name}
                  title={currentEngine.name}
                  width={18}
                  height={18}
                  className="h-4.5 w-4.5 object-contain"
                />
              </motion.span>
            </AnimatePresence>
          </span>
          <span>
            recommends — not the one it{" "}
            <span className="text-foreground/80 line-through decoration-primary/60 decoration-2">
              forgets
            </span>
            .
          </span>
        </motion.p>

        <motion.div variants={fadeUpVariants} className="mt-10 flex justify-center">
          <HeroAnalyzerForm />
        </motion.div>
      </motion.div>
    </section>
  );
}
