"use client";

import { useState } from "react";
import { Check } from "@/components/icons";
import { BLOG_NEWSLETTER } from "@/lib/landing-blog-content";

export function LandingNewsletter() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="border-b border-border bg-background" aria-labelledby="newsletter-heading">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          {/* Left — heading + subtitle */}
          <div className="min-w-0">
            <h2
              id="newsletter-heading"
              className="text-lg font-bold tracking-tight text-foreground"
            >
              {BLOG_NEWSLETTER.title}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {BLOG_NEWSLETTER.description}
            </p>
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
                className="h-9 min-w-0 flex-1 rounded-md border border-border bg-muted/40 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 sm:w-60"
              />
              <button
                type="submit"
                className="h-9 shrink-0 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
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
