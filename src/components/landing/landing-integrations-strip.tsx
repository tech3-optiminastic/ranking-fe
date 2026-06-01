"use client";

import Image from "next/image";
import { ScreenHR } from "@/components/ui/intersection-diamonds";
import { cn } from "@/lib/utils";

// Orbiting integration nodes laid out left → right across the rings.
// `tier` controls size + opacity by distance from the centre node, so the
// graphic fades toward the edges (Linear-style). The two Live integrations
// (Shopify, WordPress) sit closest to the centre.
type OrbitNode = {
  name: string;
  src: string;
  tier: 1 | 2 | 3 | 4;
};

const LEFT_NODES: OrbitNode[] = [
  { name: "Framer", src: "/logos/framer.svg", tier: 4 },
  { name: "Search Console", src: "/logos/search-console.svg", tier: 3 },
  { name: "Google Analytics", src: "/logos/google-analytics.svg", tier: 2 },
  { name: "WordPress", src: "/logos/wordpress.svg", tier: 1 },
];

const RIGHT_NODES: OrbitNode[] = [
  { name: "Shopify", src: "/logos/shopify.svg", tier: 1 },
  { name: "Slack", src: "/logos/slack.svg", tier: 2 },
  { name: "Next.js", src: "/logos/nextjs.svg", tier: 3 },
  { name: "Webflow", src: "/logos/webflow.svg", tier: 4 },
];

const TIER_STYLE: Record<OrbitNode["tier"], { box: number; icon: number; opacity: number }> = {
  1: { box: 60, icon: 28, opacity: 1 },
  2: { box: 54, icon: 26, opacity: 0.78 },
  3: { box: 48, icon: 22, opacity: 0.5 },
  4: { box: 44, icon: 20, opacity: 0.28 },
};

// Concentric orbit ring diameters (px).
const RINGS = [120, 200, 290];

export function LandingIntegrationsStrip() {
  return (
    <section className="relative bg-transparent" aria-labelledby="landing-integrations-heading">
      <ScreenHR />

      <div className="mx-auto max-w-7xl px-6 pb-12 pt-20 lg:px-12 lg:pb-14 lg:pt-24">
        {/* Orbital graphic */}
        <div className="relative mx-auto flex h-[300px] w-full max-w-2xl items-center justify-center overflow-hidden sm:h-[310px]">
          {/* Concentric rings */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            {RINGS.map((d) => (
              <div
                key={d}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/[0.07]"
                style={{ width: d, height: d }}
              />
            ))}
          </div>

          {/* Centre glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--primary) 32%, transparent) 0%, transparent 68%)",
            }}
          />

          {/* Icon row across the rings */}
          <div className="relative z-10 flex items-center gap-3 sm:gap-5">
            {LEFT_NODES.map((node) => (
              <OrbitIcon key={node.name} node={node} />
            ))}

            {/* Centre node — the “+” hub */}
            <div className="relative flex shrink-0 items-center justify-center">
              <span
                aria-hidden
                className="absolute inset-0 -z-10 animate-pulse rounded-full bg-primary/30 blur-md"
              />
              <span className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-gradient-to-b from-primary to-[color-mix(in_srgb,var(--primary)_82%,#b83227)] shadow-[0_8px_24px_-6px_rgba(224,74,61,0.6)] ring-4 ring-primary/15">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </div>

            {RIGHT_NODES.map((node) => (
              <OrbitIcon key={node.name} node={node} />
            ))}
          </div>
        </div>

        {/* Copy */}
        <div className="mx-auto mt-4 max-w-4xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Integrations
          </p>
          <h2
            id="landing-integrations-heading"
            className="mt-4 whitespace-nowrap text-2xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.65rem]"
          >
            Works where your{" "}
            <span className="relative text-primary">
              team already ships
              <span
                className="absolute -bottom-1 left-0 right-0 border-b-2 border-dashed border-primary/45"
                aria-hidden
              />
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base font-light leading-relaxed text-accent-foreground lg:text-lg">
            Auto-fix schema and meta on Shopify and WordPress, with more integrations on the way.
          </p>
        </div>
      </div>

      <ScreenHR />
    </section>
  );
}

function OrbitIcon({ node }: { node: OrbitNode }) {
  const { box, icon, opacity } = TIER_STYLE[node.tier];
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-black/[0.06] bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.18)]",
      )}
      style={{ width: box, height: box, opacity }}
      title={node.name}
    >
      <Image
        src={node.src}
        alt={node.name}
        width={icon}
        height={icon}
        className="object-contain"
        style={{ width: icon, height: icon }}
      />
    </div>
  );
}
