"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Plausible-feeling activity items. Examples (not real audits) — designed
// to suggest "this thing is actively running" without claiming specific
// real-world facts that would age poorly.
const ACTIVITY: { domain: string; verb: string; result: string }[] = [
  { domain: "vercel.com", verb: "Audited", result: "92 / 100 GEO" },
  { domain: "stripe.com", verb: "Scored", result: "+14 citations / week" },
  { domain: "shopify.com", verb: "Analyzed", result: "Top 3 in ChatGPT" },
  { domain: "figma.com", verb: "Tracked", result: "8 new prompts found" },
  { domain: "notion.so", verb: "Audited", result: "89 / 100 GEO" },
  { domain: "linear.app", verb: "Scored", result: "Citation lead vs rivals" },
  { domain: "framer.com", verb: "Analyzed", result: "Schema +12 score" },
  { domain: "anthropic.com", verb: "Tracked", result: "Cited by Perplexity" },
];

const ROTATE_MS = 3200;

export function HeroLiveTicker() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % ACTIVITY.length), ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const item = ACTIVITY[i];

  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-black/8 bg-white/85 px-3 py-1.5 text-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm">
      {/* Pulsing "live" indicator */}
      <span className="relative flex h-1.5 w-1.5 shrink-0" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-70" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>

      {/* Rotating activity line */}
      <span className="relative min-w-[260px] overflow-hidden text-left">
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="block whitespace-nowrap text-neutral-700"
          >
            <span className="font-semibold text-neutral-900">{item.verb}</span>
            <span className="mx-1.5 font-mono text-primary">{item.domain}</span>
            <span className="text-neutral-500">— {item.result}</span>
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}
