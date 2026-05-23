"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  getBacklinkCatalog,
  listBacklinkOrders,
  type BacklinkLinkType,
  type BacklinkOrder,
  type BacklinkOrderStatus,
  type BacklinkProduct,
} from "@/lib/api/analyzer";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const LINK_TYPE_LABEL: Record<BacklinkLinkType, string> = {
  guest_post: "Guest post",
  niche_edit: "Niche edit",
  sponsored: "Sponsored",
  citation: "Citation",
  other: "Other",
};

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

interface Props {
  slug: string;
}

export function SiteBacklinkMarketplacePanel({ slug }: Props) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email ?? "";

  const [products, setProducts] = useState<BacklinkProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterLinkType, setFilterLinkType] = useState<BacklinkLinkType | "all">("all");
  const [minDa, setMinDa] = useState<number>(0);

  const [orders, setOrders] = useState<BacklinkOrder[]>([]);
  const [rowError, setRowError] = useState<{ id: number; msg: string } | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);

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
      // Non-fatal, keep prior orders on screen.
    }
  }, [slug, userEmail]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([
      getBacklinkCatalog(slug),
      listBacklinkOrders(slug, userEmail || undefined).catch(() => ({ orders: [] })),
    ])
      .then(([catalog, ordersResp]) => {
        if (cancelled) return;
        setProducts(catalog.products);
        setOrders(ordersResp.orders);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Couldn't load catalog.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, userEmail]);

  const visibleProducts = useMemo(() => {
    let list = [...products];
    if (filterLinkType !== "all") list = list.filter((p) => p.link_type === filterLinkType);
    if (minDa > 0) list = list.filter((p) => (p.domain_authority ?? 0) >= minDa);
    return list;
  }, [products, filterLinkType, minDa]);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Discovering guest post opportunities…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 text-[12px] text-destructive">
          <AlertCircle className="size-3.5" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ExternalLink className="size-4 text-orange-600 dark:text-orange-400" />
          <p className="text-sm font-semibold text-foreground">Guest Post Opportunities</p>
          <span className="text-[11px] text-muted-foreground">
            {visibleProducts.length} sites found
          </span>
        </div>
        {orders.length > 0 ? (
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
        </div>
      ) : null}

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {(["all", "guest_post", "niche_edit", "sponsored", "citation"] as const).map((k) => {
          const active = filterLinkType === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setFilterLinkType(k)}
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition ${
                active
                  ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                  : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
              }`}
            >
              {k === "all" ? "All" : LINK_TYPE_LABEL[k as BacklinkLinkType]}
            </button>
          );
        })}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Min DA</span>
          <input
            type="number"
            min={0}
            max={100}
            value={minDa}
            onChange={(e) => setMinDa(Number(e.target.value) || 0)}
            className="h-6 w-14 rounded border border-border bg-card px-1.5 text-[11px] text-foreground"
          />
        </div>
      </div>

      {/* Catalog grid */}
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {visibleProducts.length === 0 ? (
          <div className="col-span-full rounded-md border border-dashed border-border/70 bg-muted/15 px-3 py-8 text-center">
            <p className="text-[12px] font-medium text-foreground">
              No opportunities match these filters
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Try removing the DA cutoff or switching link type.
            </p>
          </div>
        ) : (
          visibleProducts.map((p) => {
            const isPremium = (p.domain_authority ?? 0) >= 50;
            const initial = (p.domain || "?").trim().charAt(0).toUpperCase();
            const visitUrl = (p.extras?.contact_url as string) || `https://${p.domain}`;
            return (
              <div
                key={p.id}
                className={cn(
                  "flex min-w-0 flex-col gap-3 rounded-2xl p-4 transition shadow-sm hover:shadow-md",
                  isPremium
                    ? "bg-gradient-to-br from-orange-200/80 via-orange-100 to-amber-50 dark:from-orange-500/25 dark:via-orange-500/10 dark:to-amber-500/10"
                    : "bg-card border border-border/70",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full text-[14px] font-bold",
                      isPremium
                        ? "bg-white/90 text-orange-700 dark:bg-orange-500/90 dark:text-white"
                        : "bg-muted text-foreground",
                    )}
                    aria-hidden
                  >
                    {initial}
                  </span>
                  {isPremium ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                      High DA
                    </span>
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-col gap-0.5">
                  <p className="truncate text-[11px] text-muted-foreground">{p.provider_name}</p>
                  <p
                    className="truncate text-[15px] font-semibold leading-tight text-foreground"
                    title={p.domain}
                  >
                    {p.domain}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <span className="rounded-full bg-muted/70 px-2 py-0.5 text-[10px] font-medium text-foreground/80">
                    {LINK_TYPE_LABEL[p.link_type]}
                  </span>
                  {p.domain_authority != null ? (
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                      DA {p.domain_authority}
                    </span>
                  ) : null}
                  {p.do_follow ? (
                    <span className="rounded-full bg-muted/70 px-2 py-0.5 text-[10px] text-muted-foreground">
                      do-follow
                    </span>
                  ) : null}
                </div>

                <div className="mt-auto pt-1">
                  <a
                    href={visitUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition",
                      isPremium
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "bg-foreground text-background hover:bg-foreground/85",
                    )}
                  >
                    Visit Site
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {orders.length > 0 ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            refreshOrders();
          }}
          className="mt-2 text-[10px] text-muted-foreground hover:text-foreground hover:underline"
        >
          Refresh order status
        </button>
      ) : null}
    </div>
  );
}
