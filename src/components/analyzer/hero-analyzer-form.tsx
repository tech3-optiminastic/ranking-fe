"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { startAnalysis } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";
import { ArrowRight, Sparkles, BarChart3, Target } from "@/components/icons";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SignalorLoader } from "@/components/ui/signalor-loader";
import { RotatingGeoFact } from "@/components/ui/rotating-geo-fact";
import { BorderBeam } from "@/components/magicui/border-beam";

const COUNTRY_OPTIONS = [
  { code: "US", label: "United States" },
  { code: "CA", label: "Canada" },
  { code: "GB", label: "United Kingdom" },
  { code: "AU", label: "Australia" },
  { code: "IN", label: "India" },
  { code: "DE", label: "Germany" },
  { code: "FR", label: "France" },
  { code: "SG", label: "Singapore" },
  { code: "AE", label: "United Arab Emirates" },
];

function flagSrc(code: string): string {
  return `https://flagcdn.com/${code.toLowerCase()}.svg`;
}

const QUICK_CHIPS: { label: string; icon: typeof Sparkles }[] = [
  { label: "Audit", icon: Sparkles },
  { label: "GEO Score", icon: BarChart3 },
  { label: "Find Gaps", icon: Target },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export function HeroAnalyzerForm({ initialUrl = "" }: { initialUrl?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [url, setUrl] = useState(initialUrl);
  const [country, setCountry] = useState("United States");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedCountry = COUNTRY_OPTIONS.find((c) => c.label === country);

  async function handleAnalyze() {
    if (!url.trim()) return;
    const normalizedUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url.trim()
        : `https://${url.trim()}`;

    setError("");
    setLoading(true);
    setDir(1);
    setStep(1);

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
      setStep(0);
    }
  }

  return (
    <div className="relative w-full max-w-xl">
      {/* Soft horizontal halo glow below the card — primary palette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-2 -bottom-3 h-16 rounded-full opacity-80 blur-2xl"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #e04a3d 15%, #f4748f 45%, #fbbf24 75%, transparent 100%)",
        }}
      />

      {/* White input card — sits on top with z-10 over the orange platform below */}
      <div className="relative z-10 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_12px_30px_-12px_rgba(15,23,42,0.18)]">
        {/* Animated border beams — two for a chase effect */}
        <BorderBeam
          size={180}
          duration={10}
          colorFrom="#e04a3d"
          colorTo="#f4748f"
          cornerRadius={16}
        />
        <BorderBeam
          size={180}
          duration={10}
          delay={5}
          colorFrom="#f4748f"
          colorTo="#fbbf24"
          cornerRadius={16}
        />

        <div>
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
                className="flex min-h-[140px] flex-col"
              >
                {/* Input row with left accent bar */}
                <div className="relative flex flex-1 items-start gap-2 px-4 pt-4">
                  <span aria-hidden className="mt-0.5 h-4 w-px shrink-0 bg-primary" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Ask Signalor to audit your site (e.g. signalor.ai)"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && url.trim() && handleAnalyze()}
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Bottom toolbar — chips + country dropdown + submit */}
                <div className="flex items-center justify-between gap-2 px-3 pb-3 pt-4">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {QUICK_CHIPS.map(({ label, icon: Icon }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => inputRef.current?.focus()}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-black/10 bg-white px-2 py-1 text-xs font-medium text-neutral-700 transition-colors hover:border-black/20 hover:bg-neutral-50 hover:text-neutral-900"
                      >
                        <Icon className="h-3 w-3" strokeWidth={2} aria-hidden />
                        {label}
                      </button>
                    ))}

                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger
                        size="sm"
                        className="h-7 shrink-0 gap-1.5 rounded-md border-black/10 bg-white px-2 text-xs font-medium text-neutral-700 shadow-none hover:border-black/20 hover:bg-neutral-50 hover:text-neutral-900 focus-visible:ring-0"
                      >
                        <span className="flex items-center gap-1.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={flagSrc(selectedCountry?.code ?? "US")}
                            alt=""
                            width={14}
                            height={10}
                            className="h-2.5 w-3.5 rounded-[1px] object-cover"
                          />
                          <span>{selectedCountry?.code ?? "US"}</span>
                        </span>
                      </SelectTrigger>
                      <SelectContent position="popper" align="start" sideOffset={6}>
                        {COUNTRY_OPTIONS.map((opt) => (
                          <SelectItem key={opt.code} value={opt.label}>
                            <span className="flex items-center gap-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={flagSrc(opt.code)}
                                alt=""
                                width={16}
                                height={12}
                                className="h-3 w-4 rounded-[1px] object-cover"
                              />
                              <span>{opt.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={!url.trim()}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-white shadow-[0_4px_12px_-2px_rgba(224,74,61,0.6)] transition hover:bg-primary/90 active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none"
                    aria-label="Run audit"
                  >
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="loading"
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col items-center justify-center gap-3 px-5 py-10"
              >
                <SignalorLoader size="sm" />
                <RotatingGeoFact intervalMs={4500} size="xs" className="min-h-9 w-full max-w-md" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Orange platform — peeks out below the white card. Negative margin makes
          the white card sit ON TOP of this band, with the bottom strip visible. */}
      <div
        className="relative -mt-4 flex items-center justify-center gap-2 rounded-2xl px-6 pb-2.5 pt-7 text-xs font-semibold text-white shadow-[0_20px_40px_-12px_rgba(224,74,61,0.45)]"
        style={{
          background: "linear-gradient(90deg, #e04a3d 0%, #f4748f 50%, #fbbf24 100%)",
        }}
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
        Free first scan — no signup required
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
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
