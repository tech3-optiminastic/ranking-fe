"use client";

import { useState } from "react";
import { ArrowRight, Mail, Check } from "@/components/icons";
import { ScreenHR } from "@/components/ui/intersection-diamonds";
import { BLOG_NEWSLETTER } from "@/lib/landing-blog-content";

export function LandingNewsletter() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="relative bg-background" aria-labelledby="newsletter-heading">
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12 lg:py-16">
        {/* Primary-colored card */}
        <div className="relative overflow-hidden rounded-2xl bg-primary px-10 py-12 lg:px-14 lg:py-14">
          {/* Subtle texture rings */}
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
            style={{ background: "rgba(255,255,255,0.07)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -right-10 h-52 w-52 rounded-full"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />

          <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            {/* Left — heading + description */}
            <div>
              <h2
                id="newsletter-heading"
                className="text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl"
              >
                Subscribe to
                <br />
                our newsletter
              </h2>
              <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-white/75">
                {BLOG_NEWSLETTER.description}
              </p>
            </div>

            {/* Right — form */}
            <div>
              <p className="mb-3 text-sm font-semibold text-white">Stay Informed</p>

              {submitted ? (
                <div className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/15 px-4 py-3.5">
                  <Check className="h-4 w-4 shrink-0 text-white" aria-hidden />
                  <p className="text-sm font-medium text-white">
                    You&apos;re subscribed — see you Thursday.
                  </p>
                </div>
              ) : (
                <>
                  <form className="flex items-center gap-2" onSubmit={handleSubmit}>
                    <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/20 bg-white/95 px-3 py-2.5 shadow-sm">
                      <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                      <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                      style={{ background: "color-mix(in srgb, var(--primary) 55%, black)" }}
                    >
                      {BLOG_NEWSLETTER.cta}
                    </button>
                  </form>
                  <p className="mt-2.5 text-[11px] text-white/60">No spam. Unsubscribe anytime.</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
