"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { startAnalysis } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";
import { ArrowRight, ArrowLeft, MapPin, Sparkles } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import { RotatingGeoFact } from "@/components/ui/rotating-geo-fact";

const COUNTRY_OPTIONS = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "India",
  "Germany",
  "France",
  "Singapore",
  "United Arab Emirates",
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export function HeroAnalyzerForm({ initialUrl = "" }: { initialUrl?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 = URL, 1 = country, 2 = analyzing
  const [dir, setDir] = useState(1);
  const [url, setUrl] = useState(initialUrl);
  const [country, setCountry] = useState("United States");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function goNext() {
    if (step === 0 && !url.trim()) return;
    setDir(1);
    setStep((s) => s + 1);
  }

  function goBack() {
    setDir(-1);
    setStep((s) => s - 1);
  }

  async function handleAnalyze() {
    const normalizedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url.trim()
        : `https://${url.trim()}`;

    setError("");
    setLoading(true);
    setDir(1);
    setStep(2);

    try {
      await startAnalysis({
        url: normalizedUrl,
        run_type: "full_site",
        country,
      });
      router.push(routes.signUp);
    } catch {
      setError("Couldn't start the audit. Check the URL and try again.");
      setLoading(false);
      setDir(-1);
      setStep(1);
    }
  }

  return (
    <div className="w-full max-w-xl">
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <AnimatePresence mode="wait" custom={dir}>
          {step === 0 && (
            <motion.div
              key="url"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="relative min-h-[86px] px-4 pt-3 pb-3">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter your domain (e.g. signalor.ai)"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && url.trim() && goNext()}
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!url.trim()}
                  className="absolute bottom-3 right-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-white transition hover:bg-primary/90 active:scale-95 disabled:opacity-40"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="country"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="relative min-h-[86px] px-4 pt-3 pb-3">
                <p className="text-xs text-muted-foreground mb-2">Select your target market</p>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="w-full border-0 bg-transparent shadow-none focus:ring-0 text-sm text-foreground px-0 h-auto py-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1 text-xs text-muted-foreground transition hover:text-foreground"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary/90 active:scale-95"
                  >
                    <Sparkles className="h-3 w-3" />
                    Run audit
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="loading"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col items-center justify-center gap-3 px-5 py-8"
            >
              <SignalorLoader size="sm" />
              <RotatingGeoFact intervalMs={4500} size="xs" className="min-h-9 w-full max-w-md" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400"
          >
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
