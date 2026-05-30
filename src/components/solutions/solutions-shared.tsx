import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "@/components/icons";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { LANDING_PRIMARY_CTA_CLASS } from "@/components/landing/constants";
import { ScreenHR } from "@/components/ui/intersection-diamonds";
import { cn } from "@/lib/utils";

export function SolutionsHero({
  eyebrow,
  heading,
  highlight,
  description,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string;
  heading: ReactNode;
  highlight?: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}) {
  return (
    <section className="relative bg-transparent" aria-labelledby="solutions-hero-heading">
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-10 lg:px-12 lg:pb-16 lg:pt-14">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          [ {eyebrow} ]
        </p>
        <h1
          id="solutions-hero-heading"
          className="mt-5 max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]"
        >
          {heading}
          {highlight ? (
            <>
              {" "}
              <span className="relative whitespace-nowrap text-primary">
                {highlight}
                <span
                  className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
                  aria-hidden
                />
              </span>
            </>
          ) : null}
        </h1>
        <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
          {description}
        </p>
        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button asChild className={LANDING_PRIMARY_CTA_CLASS}>
            <Link href={primaryCta.href}>
              {primaryCta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {secondaryCta ? (
            <Button
              asChild
              variant="outline"
              className="h-10 border-black/12 bg-white px-5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function SolutionsSection({
  id,
  eyebrow,
  heading,
  highlight,
  description,
  children,
  bg = "transparent",
}: {
  id?: string;
  eyebrow: string;
  heading: ReactNode;
  highlight?: string;
  description?: string;
  children?: ReactNode;
  bg?: "transparent" | "neutral";
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("relative", bg === "neutral" ? "bg-neutral-50" : "bg-transparent")}
    >
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-12 lg:pb-16 lg:pt-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          [ {eyebrow} ]
        </p>
        <h2
          id={headingId}
          className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.5rem]"
        >
          {heading}
          {highlight ? (
            <>
              {" "}
              <span className="relative whitespace-nowrap text-primary">
                {highlight}
                <span
                  className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
                  aria-hidden
                />
              </span>
            </>
          ) : null}
        </h2>
        {description ? (
          <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-10 lg:mt-12">{children}</div> : null}
      </div>
    </section>
  );
}

export type SolutionsFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function SolutionsFeatureGrid({ features }: { features: SolutionsFeature[] }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-black/8 bg-black/8 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => {
        const Icon = f.icon;
        return (
          <article key={f.title} className="flex flex-col gap-4 bg-white p-6 lg:p-8">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4.5 w-4.5" aria-hidden />
            </div>
            <h3 className="text-base font-semibold tracking-tight text-foreground lg:text-lg">
              {f.title}
            </h3>
            <p className="text-sm font-light leading-relaxed text-accent-foreground">
              {f.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}

export type SolutionsStep = {
  n: string;
  title: string;
  body: string;
  icon: LucideIcon;
};

export function SolutionsSteps({ steps }: { steps: SolutionsStep[] }) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-sm border border-black/8 bg-black/8 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.n} className="flex flex-col gap-5 bg-white p-6 lg:p-8">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                {s.n}
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Step {s.n}
              </span>
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{s.title}</h3>
            <p className="text-sm font-light leading-relaxed text-accent-foreground">{s.body}</p>
            <div className="mt-auto inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/8 bg-neutral-50 text-neutral-500">
              <Icon className="h-4 w-4" aria-hidden />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type SolutionsBenefit = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function SolutionsBenefitsList({ benefits }: { benefits: SolutionsBenefit[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {benefits.map((b) => {
        const Icon = b.icon;
        return (
          <li
            key={b.title}
            className="flex items-start gap-4 rounded-sm border border-black/8 bg-white p-5 lg:p-6"
          >
            <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-foreground">{b.title}</h3>
              <p className="mt-1.5 text-sm font-light leading-relaxed text-accent-foreground">
                {b.description}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function SolutionsBottomCTA({
  eyebrow,
  heading,
  description,
  primaryCta,
  secondaryCta,
}: {
  eyebrow: string;
  heading: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}) {
  return (
    <section className="relative bg-transparent" aria-labelledby="solutions-bottom-cta-heading">
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-12 lg:py-20">
        <div className="relative overflow-hidden rounded-sm border border-black/8 bg-white p-8 shadow-[0_12px_30px_-18px_rgba(15,23,42,0.18)] sm:p-12 lg:p-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
            [ {eyebrow} ]
          </p>
          <h2
            id="solutions-bottom-cta-heading"
            className="mt-3 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.25rem]"
          >
            {heading}
          </h2>
          <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
            {description}
          </p>
          <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button asChild className={LANDING_PRIMARY_CTA_CLASS}>
              <Link href={primaryCta.href}>
                {primaryCta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            {secondaryCta ? (
              <Button
                asChild
                variant="outline"
                className="h-10 border-black/12 bg-white px-5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
              >
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            ) : null}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -bottom-24 h-40 opacity-60 blur-2xl"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, #e04a3d 20%, #f4748f 50%, #fbbf24 80%, transparent 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

export function SolutionsInlineCTA({
  heading,
  description,
  primaryCta,
  secondaryCta,
}: {
  heading: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}) {
  return (
    <div className="rounded-sm border border-black/8 bg-neutral-50 p-6 lg:p-8">
      <div className="flex flex-col items-start justify-between gap-5 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold tracking-tight text-foreground lg:text-xl">
            {heading}
          </h3>
          <p className="mt-2 text-sm font-light leading-relaxed text-accent-foreground lg:text-[15px]">
            {description}
          </p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <Button asChild className={LANDING_PRIMARY_CTA_CLASS}>
            <Link href={primaryCta.href}>
              {primaryCta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          {secondaryCta ? (
            <Button
              asChild
              variant="outline"
              className="h-10 border-black/12 bg-white px-5 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function SolutionsInternalLinks({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string; description: string }[];
}) {
  return (
    <div className="rounded-sm border border-black/8 bg-white p-6 lg:p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {heading}
      </p>
      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group flex flex-col gap-1.5 rounded-md border border-black/8 bg-neutral-50 px-4 py-3 transition-colors hover:border-primary/30 hover:bg-white"
            >
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground group-hover:text-primary">
                {l.label}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="text-xs font-light leading-relaxed text-accent-foreground">
                {l.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
