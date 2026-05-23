"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
} from "@/components/icons";
import {
  deleteBacklinkOrder,
  listBacklinkOrders,
  type BacklinkOrder,
  type BacklinkOrderStatus,
} from "@/lib/api/analyzer";
import { useSession } from "@/lib/auth-client";

const STATUS_STYLES: Record<BacklinkOrderStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-muted/40 text-muted-foreground border-border" },
  pending_payment: {
    label: "Pay pending",
    cls: "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:text-amber-300",
  },
  queued: {
    label: "Queued",
    cls: "bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-300",
  },
  in_progress: {
    label: "In progress",
    cls: "bg-orange-500/15 text-orange-800 border-orange-500/40 dark:text-orange-300",
  },
  delivered: {
    label: "Delivered",
    cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  },
  rejected: {
    label: "Rejected",
    cls: "bg-rose-500/10 text-rose-700 border-rose-500/30 dark:text-rose-300",
  },
  refunded: { label: "Refunded", cls: "bg-muted/40 text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", cls: "bg-muted/40 text-muted-foreground border-border" },
};

interface BacklinkProvider {
  name: string;
  domain: string;
  tagline: string;
  description: string;
  linkTypes: string[];
  daRange: string;
  priceFrom: string;
  turnaround: string;
  badge?: string;
  pricingUrl: string;
}

const BACKLINK_PROVIDERS: BacklinkProvider[] = [
  {
    name: "FATJOE",
    domain: "fatjoe.com",
    tagline: "Managed link building at scale",
    description:
      "White-label guest posts and niche edits on real, editorial sites. Used by thousands of agencies worldwide.",
    linkTypes: ["Guest Post", "Niche Edit", "Citation"],
    daRange: "DA 20–90",
    priceFrom: "From $55",
    turnaround: "10–21 days",
    badge: "Most popular",
    pricingUrl: "https://fatjoe.com/link-building/",
  },
  {
    name: "The HOTH",
    domain: "thehoth.com",
    tagline: "Full-service link building & SEO",
    description:
      "Guest posts, managed link building campaigns, and press release distribution on high-authority publications.",
    linkTypes: ["Guest Post", "Press Release", "Link Building"],
    daRange: "DA 20–80",
    priceFrom: "From $60",
    turnaround: "7–21 days",
    badge: "Best for agencies",
    pricingUrl: "https://www.thehoth.com/link-building-services/",
  },
  {
    name: "LinksThatRank",
    domain: "linksthatrank.com",
    tagline: "Premium niche edits & guest posts",
    description:
      "Manual outreach to vetted, topically relevant sites. 90-day link guarantee. No PBNs, no spam.",
    linkTypes: ["Niche Edit", "Guest Post"],
    daRange: "DA 30–70",
    priceFrom: "From $177",
    turnaround: "14–28 days",
    badge: "High quality",
    pricingUrl: "https://linksthatrank.com/order/",
  },
  {
    name: "Authority Builders",
    domain: "authoritybuilders.com",
    tagline: "Real guest posts on traffic-verified sites",
    description:
      "All sites verified for real organic traffic via SEMrush. Strict editorial standards. White-hat only.",
    linkTypes: ["Guest Post", "Niche Edit"],
    daRange: "DA 30–80",
    priceFrom: "From $125",
    turnaround: "21–30 days",
    pricingUrl: "https://authoritybuilders.com/link-building/",
  },
  {
    name: "uSERP",
    domain: "userp.io",
    tagline: "High-authority links for SaaS & tech",
    description:
      "Specialises in DA 50+ placements on Entrepreneur, HubSpot, G2, and other top-tier SaaS publications.",
    linkTypes: ["Guest Post", "Digital PR"],
    daRange: "DA 50–90",
    priceFrom: "From $500",
    turnaround: "30–45 days",
    badge: "Premium tier",
    pricingUrl: "https://userp.io/pricing/",
  },
  {
    name: "Loganix",
    domain: "loganix.com",
    tagline: "Transparent link building & SEO",
    description:
      "Guest posts, niche edits, citation building, and local SEO. All links indexed and guaranteed.",
    linkTypes: ["Guest Post", "Niche Edit", "Citation"],
    daRange: "DA 25–70",
    priceFrom: "From $85",
    turnaround: "14–21 days",
    pricingUrl: "https://loganix.com/link-building-services/",
  },
  {
    name: "BrightLocal",
    domain: "brightlocal.com",
    tagline: "Local SEO & citation building",
    description:
      "Leading platform for local citation building, NAP audits, and review management. Ideal for local GEO presence.",
    linkTypes: ["Citation", "Local SEO"],
    daRange: "Local listings",
    priceFrom: "From $2/citation",
    turnaround: "3–7 days",
    badge: "Best for local",
    pricingUrl: "https://www.brightlocal.com/local-citation-building/",
  },
  {
    name: "EIN Presswire",
    domain: "einpresswire.com",
    tagline: "Affordable press release distribution",
    description:
      "Distribute press releases to thousands of news outlets, journalists, and syndication partners worldwide.",
    linkTypes: ["Press Release", "Sponsored"],
    daRange: "DA 50–90",
    priceFrom: "From $49.95",
    turnaround: "Same day",
    pricingUrl: "https://www.einpresswire.com/pricing/",
  },
  {
    name: "Stellar SEO",
    domain: "stellarseo.com",
    tagline: "Custom link building campaigns",
    description:
      "Tailored manual outreach campaigns for competitive niches. Dedicated account managers, no templates.",
    linkTypes: ["Guest Post", "Niche Edit", "Link Building"],
    daRange: "DA 30–80",
    priceFrom: "From $200",
    turnaround: "21–35 days",
    pricingUrl: "https://stellarseo.com/link-building-services/",
  },
  {
    name: "Niche Website Builders",
    domain: "nichewebsitebuilders.com",
    tagline: "Niche-relevant link insertions",
    description:
      "Content-focused niche edits and guest posts targeting topically relevant audiences. Reporting included.",
    linkTypes: ["Niche Edit", "Guest Post"],
    daRange: "DA 20–60",
    priceFrom: "From $150",
    turnaround: "14–21 days",
    pricingUrl: "https://www.nichewebsitebuilders.com/link-building/",
  },
];

function getFaviconUrl(domain: string) {
  return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=64`;
}

interface Props {
  slug: string;
}

export function SiteBacklinkMarketplacePanel({ slug }: Props) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";

  const [orders, setOrders] = useState<BacklinkOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [rowError, setRowError] = useState<{ id: number; msg: string } | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);

  const [filterType, setFilterType] = useState<string>("all");

  async function removeOrder(order: BacklinkOrder) {
    if (order.status === "delivered") return;
    const confirmed = window.confirm(
      order.status === "queued" || order.status === "in_progress"
        ? `Cancel this order on ${order.domain}? It will be marked cancelled.`
        : `Delete this order on ${order.domain}?`,
    );
    if (!confirmed) return;
    setDeletingOrderId(order.id);
    try {
      await deleteBacklinkOrder(slug, order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't delete order.";
      setRowError({ id: order.id, msg });
    } finally {
      setDeletingOrderId(null);
    }
  }

  const refreshOrders = useCallback(async () => {
    if (!slug) return;
    try {
      const r = await listBacklinkOrders(slug, userEmail || undefined);
      setOrders(r.orders);
    } catch {
      // Non-fatal — keep prior orders on screen.
    }
  }, [slug, userEmail]);

  useEffect(() => {
    if (!slug) return;
    setOrdersLoading(true);
    listBacklinkOrders(slug, userEmail || undefined)
      .then((r) => setOrders(r.orders))
      .catch(() => {})
      .finally(() => setOrdersLoading(false));
  }, [slug, userEmail]);

  const allTypes = ["all", "Guest Post", "Niche Edit", "Citation", "Press Release", "Local SEO"];

  const visibleProviders =
    filterType === "all"
      ? BACKLINK_PROVIDERS
      : BACKLINK_PROVIDERS.filter((p) => p.linkTypes.includes(filterType));

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ExternalLink className="size-4 text-orange-600 dark:text-orange-400" />
          <p className="text-sm font-semibold text-foreground">Backlink Providers</p>
          <span className="text-[11px] text-muted-foreground">
            {visibleProviders.length} providers
          </span>
        </div>
        {!ordersLoading && orders.length > 0 ? (
          <span className="text-[11px] text-muted-foreground">
            {orders.length} order{orders.length === 1 ? "" : "s"} placed
          </span>
        ) : null}
      </div>

      {/* Existing orders */}
      {orders.length > 0 ? (
        <div className="mt-3 space-y-1.5">
          {orders.map((o) => {
            const s = STATUS_STYLES[o.status];
            const orderRowError = rowError && rowError.id === o.id ? rowError.msg : null;
            return (
              <div key={o.id} className="rounded-md border border-border bg-muted/15">
                <div className="flex min-w-0 items-center gap-2 px-2.5 py-1.5">
                  {o.status === "delivered" ? (
                    <CheckCircle2 className="size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Clock className="size-3.5 shrink-0 text-orange-600 dark:text-orange-400" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-foreground">
                      {o.title || o.domain}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {o.target_url} · &ldquo;{o.anchor_text}&rdquo;
                    </p>
                  </div>
                  <span className={`rounded border px-1.5 py-px text-[9px] font-semibold ${s.cls}`}>
                    {s.label}
                  </span>
                  {o.proof_url ? (
                    <a
                      href={o.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-600 hover:text-orange-700 dark:text-orange-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="size-3" />
                    </a>
                  ) : null}
                  {o.status !== "delivered" ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeOrder(o);
                      }}
                      disabled={deletingOrderId === o.id}
                      className="rounded-md p-1 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      aria-label="Delete order"
                      title="Delete order"
                    >
                      {deletingOrderId === o.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                    </button>
                  ) : null}
                </div>
                {orderRowError ? (
                  <div className="border-t border-destructive/20 bg-destructive/5 px-2.5 py-1 text-[10px] text-destructive">
                    {orderRowError}
                  </div>
                ) : null}
              </div>
            );
          })}
          <button
            type="button"
            onClick={refreshOrders}
            className="mt-1 text-[10px] text-muted-foreground hover:text-foreground hover:underline"
          >
            Refresh order status
          </button>
        </div>
      ) : null}

      {/* Filter chips */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {allTypes.map((t) => {
          const active = filterType === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition ${
                active
                  ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                  : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
              }`}
            >
              {t === "all" ? "All providers" : t}
            </button>
          );
        })}
      </div>

      {/* Provider cards */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProviders.map((provider) => (
          <div
            key={provider.name}
            className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition hover:shadow-md"
          >
            {/* Provider header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getFaviconUrl(provider.domain)}
                  alt={provider.name}
                  width={28}
                  height={28}
                  className="size-7 shrink-0 rounded-md object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold leading-tight text-foreground">
                    {provider.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{provider.domain}</p>
                </div>
              </div>
              {provider.badge ? (
                <span className="shrink-0 rounded-full bg-orange-500 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                  {provider.badge}
                </span>
              ) : null}
            </div>

            {/* Tagline & description */}
            <div>
              <p className="text-[11px] font-medium text-foreground">{provider.tagline}</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                {provider.description}
              </p>
            </div>

            {/* Link type chips */}
            <div className="flex flex-wrap gap-1">
              {provider.linkTypes.map((lt) => (
                <span
                  key={lt}
                  className="rounded-full bg-muted/60 px-2 py-0.5 text-[9px] font-medium text-foreground/80"
                >
                  {lt}
                </span>
              ))}
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                {provider.priceFrom}
              </span>
              <span>·</span>
              <span>{provider.daRange}</span>
              <span>·</span>
              <span>{provider.turnaround}</span>
            </div>

            {/* CTA */}
            <div className="mt-auto pt-1">
              <a
                href={provider.pricingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-orange-600 px-4 py-1.5 text-[11px] font-semibold text-white transition hover:bg-orange-700"
              >
                View Pricing
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {visibleProviders.length === 0 ? (
        <div className="mt-3 rounded-md border border-dashed border-border/70 bg-muted/15 px-3 py-8 text-center">
          <AlertCircle className="mx-auto mb-2 size-5 text-muted-foreground" />
          <p className="text-[12px] font-medium text-foreground">No providers match this filter</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Try selecting a different link type.
          </p>
        </div>
      ) : null}

      {/* Footer note */}
      <p className="mt-4 text-[10px] text-muted-foreground">
        These are third-party providers. Prices and availability may change. Always verify on the
        provider&apos;s website before purchasing.
      </p>
    </div>
  );
}
