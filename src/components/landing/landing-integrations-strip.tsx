"use client";

import { ScreenHR } from "@/components/ui/intersection-diamonds";
import { cn } from "@/lib/utils";

type IntegrationTile = {
  kind: "logo";
  name: string;
  src: string;
  comingSoon?: boolean;
};

const INTEGRATIONS: IntegrationTile[] = [
  { kind: "logo", name: "Shopify", src: "/logos/shopify.svg" },
  { kind: "logo", name: "WordPress", src: "/logos/wordpress.svg" },
  { kind: "logo", name: "Google Analytics", src: "/logos/google-analytics.svg", comingSoon: true },
  { kind: "logo", name: "Search Console", src: "/logos/search-console.svg", comingSoon: true },
  { kind: "logo", name: "Slack", src: "/logos/slack.svg", comingSoon: true },
  { kind: "logo", name: "Zapier", src: "/logos/zapier.svg", comingSoon: true },
];

export function LandingIntegrationsStrip() {
  return (
    <section className="relative bg-transparent" aria-labelledby="landing-integrations-heading">
      <ScreenHR />
      <div className="mx-auto max-w-7xl px-6 pb-12 pt-14 lg:px-12 lg:pb-14 lg:pt-16">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400">
          [ integrations ]
        </p>
        <h2
          id="landing-integrations-heading"
          className="mt-4 max-w-4xl text-3xl font-bold leading-[1.12] tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]"
        >
          Works where your{" "}
          <span className="relative whitespace-nowrap text-primary">
            team already ships
            <span
              className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
              aria-hidden
            />
          </span>
        </h2>
        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
          Auto-fix schema and meta on Shopify or WordPress today. Analytics, alerts, and workflow
          tiles land over the next two sprints.
        </p>
      </div>

      <ScreenHR />

      <div className="mx-auto max-w-7xl bg-black-10">
        <div className="grid grid-cols-2 divide-x divide-y divide-black/6 sm:grid-cols-3 lg:grid-cols-6">
          {INTEGRATIONS.map((t, i) => (
            <IntegrationCell key={t.name} tile={t} index={i} />
          ))}
        </div>
      </div>

      <ScreenHR />
    </section>
  );
}

function IntegrationCell({ tile, index }: { tile: IntegrationTile; index: number }) {
  void index;
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 bg-white px-4 py-10 md:py-12",
      )}
    >
      <img
        src={tile.src}
        alt={tile.name}
        width={40}
        height={40}
        decoding="async"
        className={`h-10 w-10 object-contain transition ${tile.comingSoon ? "grayscale opacity-60 hover:grayscale-0 hover:opacity-100" : "opacity-80 hover:opacity-100"}`}
      />
      <p className="text-[11px] font-semibold text-neutral-700">{tile.name}</p>
      {tile.comingSoon ? (
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-neutral-500">
          Coming soon
        </span>
      ) : (
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-emerald-700">
          Live
        </span>
      )}
    </div>
  );
}
