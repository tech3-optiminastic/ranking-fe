"use client";

import { useState } from "react";
import { Check, Mail } from "@/components/icons";

export function LandingNewsletter() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section
      className="relative border-b border-border bg-gradient-to-br from-primary/[0.06] via-white to-primary/[0.04]"
      aria-labelledby="newsletter-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          {/* Left — icon + heading + subtitle */}
          <div className="flex min-w-0 items-start gap-4">
            <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_6px_16px_-6px_rgba(224,74,61,0.6)] sm:flex">
              <Mail className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                Newsletter
              </p>
              <h2
                id="newsletter-heading"
                className="mt-1.5 text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Subscribe to our newsletter
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                New GEO tactics every Thursday — one email, one tactic, zero fluff.
              </p>
            </div>
          </div>

          {/* Right — form or success */}
          {submitted ? (
            <div className="flex shrink-0 items-center gap-2 text-sm font-medium text-primary">
              <Check className="h-4 w-4" aria-hidden />
              Subscribed — see you Thursday.
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex w-full shrink-0 items-center gap-2 sm:w-auto"
            >
              <input
                type="email"
                required
                placeholder="Your email here…"
                className="h-10 min-w-0 flex-1 rounded-md border border-border bg-white/80 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-64"
              />
              <button
                type="submit"
                className="h-10 shrink-0 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_4px_14px_-4px_rgba(224,74,61,0.5)] transition hover:opacity-90"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
