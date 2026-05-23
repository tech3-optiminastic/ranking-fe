"use client";

import Link from "next/link";
import { ArrowRight, Gift, Link2, Trophy, Users } from "@/components/icons";
import { CornerDiamonds } from "@/components/ui/intersection-diamonds";
import { LANDING_PRIMARY_CTA_CLASS } from "./constants";

const STEPS = [
  {
    icon: Users,
    title: "Apply in 30 seconds",
    description: "Tell us your name and where you post. Auto-approved, no calls.",
  },
  {
    icon: Link2,
    title: "Share your link",
    description: "Get an 8-char code with a 30-day attribution window.",
  },
  {
    icon: Trophy,
    title: "Earn on every signup",
    description: "20% of the first paid invoice. Tracked, locked, paid monthly.",
  },
] as const;

export function LandingPartnersProgram() {
  return (
    <section
      className="relative border-t border-black/8 bg-white"
      aria-labelledby="landing-partners-heading"
    >
      <CornerDiamonds top />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-20 sm:py-24 lg:grid-cols-12 lg:gap-12 lg:px-12">
        {/* Left: pitch + CTAs */}
        <div className="lg:col-span-7">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
            [ creators program ]
          </p>
          <h2
            id="landing-partners-heading"
            className="mt-4 max-w-3xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]"
          >
            Earn{" "}
            <span className="relative whitespace-nowrap text-primary">
              20%
              <span
                className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
                aria-hidden
              />
            </span>{" "}
            for every signup. Give your audience{" "}
            <span className="relative whitespace-nowrap text-primary">
              10% off
              <span
                className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
                aria-hidden
              />
            </span>
            .
          </h2>
          <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
            Recommend Signalor to your audience and we&apos;ll cut you in. 20% of the first paid
            invoice for you, an instant 10% discount for them. No quotas, no gatekeeping.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/creators-program" className={LANDING_PRIMARY_CTA_CLASS}>
              Apply to the program
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
            <Link
              href="/creators-program"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground/80 hover:text-foreground"
            >
              How payouts work
              <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex flex-col gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 bg-white text-primary shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
                </span>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{description}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: payout visual card */}
        <div className="lg:col-span-5">
          <div className="relative h-full overflow-hidden rounded-2xl border border-black/10 bg-gradient-to-br from-primary/5 via-white to-primary/10 p-7 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.18)]">
            {/* halo glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-12 right-0 h-32 w-32 rounded-full opacity-50 blur-3xl"
              style={{
                background: "linear-gradient(135deg, #e04a3d 0%, #fbbf24 100%)",
              }}
            />

            <div className="relative">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <Gift className="h-3.5 w-3.5" aria-hidden />
                Example payout
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-baseline justify-between gap-4 border-b border-black/8 pb-4">
                  <span className="text-sm text-muted-foreground">Friend signs up for Pro</span>
                  <span className="font-mono text-sm font-semibold text-foreground">$49.99</span>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-black/8 pb-4">
                  <span className="text-sm text-muted-foreground">Their 10% creator discount</span>
                  <span className="font-mono text-sm font-semibold text-emerald-600">− $5.00</span>
                </div>
                <div className="flex items-baseline justify-between gap-4 border-b border-black/8 pb-4">
                  <span className="text-sm text-muted-foreground">They pay</span>
                  <span className="font-mono text-sm font-semibold text-foreground">$44.99</span>
                </div>
                <div className="flex items-baseline justify-between gap-4 pt-2">
                  <span className="text-sm font-semibold text-foreground">You earn (20%)</span>
                  <span className="font-mono text-2xl font-bold tracking-tight text-primary">
                    $9.00
                  </span>
                </div>
              </div>

              <p className="mt-6 text-[12px] leading-relaxed text-muted-foreground">
                Paid out monthly after the 30-day refund window. Track everything from a public
                dashboard — no login required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
