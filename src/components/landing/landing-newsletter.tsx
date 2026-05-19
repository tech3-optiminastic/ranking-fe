"use client";

import { useState } from "react";
import { ArrowRight, Mail, Check } from "@/components/icons";
import { CornerDiamonds, ScreenHR } from "@/components/ui/intersection-diamonds";
import { BLOG_NEWSLETTER } from "@/lib/landing-blog-content";

export function LandingNewsletter() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="relative bg-muted/30" aria-labelledby="newsletter-heading">
      <ScreenHR />
      <CornerDiamonds top />
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-16 lg:px-12 lg:pb-20 lg:pt-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
            [ newsletter ]
          </p>

          <h2
            id="newsletter-heading"
            className="mt-4 text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl"
          >
            {BLOG_NEWSLETTER.title}
          </h2>

          <p className="mt-4 text-base font-light leading-relaxed text-accent-foreground">
            {BLOG_NEWSLETTER.description}
          </p>

          {submitted ? (
            <div className="mt-8 flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-6 py-4">
              <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <p className="text-sm font-medium text-primary">
                You&apos;re subscribed — see you Thursday.
              </p>
            </div>
          ) : (
            <form
              className="mt-8 flex items-center gap-2 rounded-full border border-border bg-background p-1.5 shadow-sm"
              onSubmit={handleSubmit}
            >
              <Mail className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <input
                type="email"
                required
                placeholder="you@domain.com"
                className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                {BLOG_NEWSLETTER.cta}
                <ArrowRight className="ml-1.5 inline h-3.5 w-3.5" aria-hidden />
              </button>
            </form>
          )}

          <p className="mt-3 text-[11px] text-muted-foreground">No spam. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}
