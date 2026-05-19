"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import {
  getInvoiceList,
  getSubscriptionStatus,
  getUsage,
  type SubscriptionStatus,
  type UsageData,
} from "@/lib/api/payments";
import Link from "next/link";
import {
  CreditCard,
  CheckCircle2,
  FileDown,
  XCircle,
  Zap,
  Crown,
  Rocket,
  AlertTriangle,
} from "@/components/icons";
import { EngineBadge } from "@/components/ui/engine-badge";
import { engineLabel } from "@/lib/engines";
import { config } from "@/lib/config";
import { DashboardSettingsNav } from "@/components/settings/dashboard-settings-nav";
import { BillingSkeleton } from "@/components/dashboard/skeletons";
import { cn } from "@/lib/utils";

const PLAN_ICONS: Record<string, typeof Zap> = {
  starter: Zap,
  pro: Crown,
  business: Rocket,
};

/** Mirrors the profile page so all of /settings/* feels one app. */
function FieldRow({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 py-5 md:grid-cols-[280px_1fr] md:gap-10">
      <div>
        <p className="text-[14px] font-semibold tracking-tight text-neutral-900">{label}</p>
        {helper ? (
          <p className="mt-1 text-[12px] font-light leading-relaxed text-neutral-500">{helper}</p>
        ) : null}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

const CARD = "rounded-lg border border-black/8 bg-white shadow-sm";
const CARD_HEADER = "border-b border-black/8 px-6 py-4";
const CARD_TITLE = "text-[13px] font-semibold tracking-tight text-neutral-900";
const CARD_SUBTITLE = "mt-0.5 text-[12px] font-light text-neutral-500";
const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-[12px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50";

function UsageBar({
  label,
  used,
  max,
  atLimit,
}: {
  label: string;
  used: number;
  max: number;
  atLimit: boolean;
}) {
  const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0;
  const warn = pct >= 80 && !atLimit;
  const barColor = atLimit ? "bg-rose-500" : warn ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[12px]">
        <span className="font-medium text-neutral-700">{label}</span>
        <span
          className={cn(
            "font-semibold tabular-nums",
            atLimit ? "text-rose-600" : warn ? "text-amber-600" : "text-neutral-900",
          )}
        >
          {used} / {max}
          {atLimit ? (
            <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600">
              <AlertTriangle className="h-3 w-3" /> Limit
            </span>
          ) : null}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function BillingSettingsPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const [sub, setSub] = useState<SubscriptionStatus | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!email) return;
    Promise.all([
      getSubscriptionStatus(email).catch(() => null),
      getUsage(email).catch(() => null),
    ]).then(([s, u]) => {
      setSub(s);
      setUsage(u);
      setLoading(false);
    });
  }, [email]);

  const PlanIcon = sub ? PLAN_ICONS[sub.plan] || Zap : Zap;
  const atAnyLimit = usage?.at_limit.projects || usage?.at_limit.prompts;
  const renewsDate =
    sub?.is_active && sub.current_period_end
      ? new Date(sub.current_period_end).toLocaleDateString("en-GB", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : null;

  return (
    <div className="px-2 py-2 font-sans">
      <DashboardSettingsNav label="Billing" />

      <div className="mt-4 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Billing &amp; Usage
        </h2>
        <p className="mt-1 text-[13px] font-light leading-relaxed text-neutral-500">
          Manage your subscription and track what you&rsquo;ve used this period.
        </p>
      </div>

      {loading ? (
        <BillingSkeleton />
      ) : (
        <>
          {/* ── Subscription ──────────────────────────────────────────── */}
          <div className={CARD}>
            <div className={CARD_HEADER}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className={CARD_TITLE}>Subscription</p>
                  <p className={CARD_SUBTITLE}>Your current plan and renewal date.</p>
                </div>
                {sub?.is_active ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-tight text-emerald-700">
                    Active
                  </span>
                ) : (
                  <Link href="/pricing" className={BTN_PRIMARY}>
                    <CreditCard className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Choose a plan
                  </Link>
                )}
              </div>
            </div>

            <div className="divide-y divide-black/8 px-6">
              <FieldRow label="Status" helper="Whether your plan is currently billing and active.">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md border",
                      sub?.is_active
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-50 text-rose-600",
                    )}
                  >
                    {sub?.is_active ? (
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                    ) : (
                      <XCircle className="h-3.5 w-3.5" strokeWidth={2} />
                    )}
                  </span>
                  <span className="text-[13px] font-semibold tracking-tight text-neutral-900">
                    {sub?.is_active ? "Active" : "No active subscription"}
                  </span>
                </div>
              </FieldRow>

              <FieldRow
                label="Plan"
                helper="Determines projects, prompt cap, and which AI engines are included."
              >
                <div className="flex items-center gap-2">
                  <PlanIcon className="h-4 w-4 text-primary" strokeWidth={1.75} />
                  <span className="text-[13px] font-semibold tracking-tight text-neutral-900">
                    {sub?.plan_label || "Starter"}
                  </span>
                </div>
              </FieldRow>

              {renewsDate ? (
                <FieldRow
                  label="Next billing date"
                  helper="The next time your card will be charged."
                >
                  <span className="text-[13px] text-neutral-900">{renewsDate}</span>
                </FieldRow>
              ) : null}

              <FieldRow
                label="AI engines included"
                helper="Engines marked unavailable require a higher plan."
              >
                <div className="flex flex-wrap gap-1.5">
                  {["gemini", "google", "chatgpt", "perplexity", "claude"].map((eng) => {
                    const allowed = sub?.limits?.engines.includes(eng) ?? false;
                    return (
                      <span
                        key={eng}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-tight",
                          allowed
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-black/8 bg-neutral-50 text-neutral-400 line-through",
                        )}
                      >
                        <EngineBadge engine={eng} size={14} />
                        {engineLabel(eng)}
                      </span>
                    );
                  })}
                </div>
              </FieldRow>
            </div>

            {sub?.is_active && sub.plan !== "business" ? (
              <div className="flex items-center justify-between gap-3 border-t border-black/8 px-6 py-4">
                <p className="text-[12px] text-neutral-500">
                  {atAnyLimit
                    ? "You've hit your plan limit — upgrade to add more capacity."
                    : "Need more projects, prompts, or engines?"}
                </p>
                <Link href="/pricing" className={BTN_PRIMARY}>
                  <Rocket className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Upgrade
                </Link>
              </div>
            ) : null}
          </div>

          {/* ── Usage ─────────────────────────────────────────────────── */}
          {usage ? (
            <div className={cn(CARD, "mt-6")}>
              <div className={cn(CARD_HEADER, "flex items-center justify-between")}>
                <div>
                  <p className={CARD_TITLE}>Usage this period</p>
                  <p className={CARD_SUBTITLE}>Counts reset on your next billing date.</p>
                </div>
                {atAnyLimit ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold tracking-tight text-rose-700">
                    <AlertTriangle className="h-3 w-3" /> At limit
                  </span>
                ) : null}
              </div>

              <div className="divide-y divide-black/8 px-6">
                <FieldRow
                  label="Projects"
                  helper="Each project is a workspace with its own scoring runs and prompts."
                >
                  <UsageBar
                    label="Projects in use"
                    used={usage.usage.projects}
                    max={usage.limits.max_projects}
                    atLimit={usage.at_limit.projects}
                  />
                </FieldRow>

                <FieldRow
                  label="Tracked prompts"
                  helper="Prompts we re-run across AI engines to track your brand."
                >
                  <UsageBar
                    label="Prompts tracked"
                    used={usage.usage.prompts}
                    max={usage.limits.max_prompts}
                    atLimit={usage.at_limit.prompts}
                  />
                </FieldRow>

                <FieldRow
                  label="Analysis runs"
                  helper="Number of scans completed since your last billing date."
                >
                  <span className="text-[14px] font-semibold tabular-nums text-neutral-900">
                    {usage.usage.runs_this_month}
                  </span>
                </FieldRow>
              </div>
            </div>
          ) : null}

          {/* ── Plan features ─────────────────────────────────────────── */}
          {sub?.is_active && sub.limits ? (
            <div className={cn(CARD, "mt-6")}>
              <div className={CARD_HEADER}>
                <p className={CARD_TITLE}>What&rsquo;s included in your plan</p>
              </div>
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                  {[
                    `${sub.limits.max_projects} project${sub.limits.max_projects > 1 ? "s" : ""}`,
                    `Up to ${sub.limits.max_prompts} tracked prompts`,
                    `Engines: ${sub.limits.engines.map((e: string) => engineLabel(e)).join(", ")}`,
                    ...(sub.limits.features ?? []).filter(
                      (f: string) =>
                        !f.toLowerCase().startsWith("up to") &&
                        !f.toLowerCase().startsWith("1 project") &&
                        !f.toLowerCase().startsWith("3 project") &&
                        !f.toLowerCase().startsWith("4 project") &&
                        !f.toLowerCase().startsWith("engines"),
                    ),
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <CheckCircle2
                        className="h-3.5 w-3.5 shrink-0 text-emerald-600"
                        strokeWidth={2}
                      />
                      <span className="text-[13px] text-neutral-900">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* ── Invoices ──────────────────────────────────────────────── */}
          {sub?.is_active && email ? <InvoicesSection email={email} /> : null}

          <p className="mt-6 text-center text-[11px] font-light text-neutral-500">
            Payments are processed securely by Dodo Payments. Cancel anytime.
          </p>
        </>
      )}
    </div>
  );
}

function InvoicesSection({ email }: { email: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["invoices", email],
    queryFn: () => getInvoiceList(email),
    enabled: !!email,
  });

  const items = data?.items ?? [];

  return (
    <div className={cn(CARD, "mt-6")}>
      <div className={CARD_HEADER}>
        <p className={CARD_TITLE}>Invoices</p>
        <p className={CARD_SUBTITLE}>Download a PDF receipt for any successful payment.</p>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <p className="text-[12px] text-neutral-500">Loading invoices…</p>
        ) : error ? (
          <p className="text-[12px] text-neutral-500">
            Could not load invoices right now. Try again in a moment.
          </p>
        ) : items.length === 0 ? (
          <p className="text-[12px] text-neutral-500">
            No invoices yet — they&rsquo;ll appear here after your first successful charge.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border border-black/8">
            <table className="w-full text-left text-[12px]">
              <thead className="border-b border-black/8 bg-neutral-50 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.payment_id} className="border-b border-black/8 last:border-0">
                    <td className="px-3 py-2.5 text-neutral-900">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 font-medium tabular-nums text-neutral-900">
                      {row.amount != null
                        ? `${row.currency ?? ""} ${row.amount.toFixed(2)}`.trim()
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      <InvoiceStatusPill status={row.status} />
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <a
                        href={`${config.apiBaseUrl}/api/payments/invoice/?email=${encodeURIComponent(email)}&payment_id=${encodeURIComponent(row.payment_id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-black/10 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50"
                      >
                        <FileDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function InvoiceStatusPill({ status }: { status: string | null }) {
  if (!status) return <span className="text-neutral-400">—</span>;
  const s = status.toLowerCase();
  let cls = "bg-neutral-100 text-neutral-700 border-black/10";
  if (s === "succeeded" || s === "paid" || s === "completed") {
    cls = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (s === "failed" || s === "declined") {
    cls = "bg-rose-50 text-rose-700 border-rose-200";
  } else if (s === "refunded" || s === "partially_refunded") {
    cls = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (s === "pending" || s === "processing") {
    cls = "bg-blue-50 text-blue-700 border-blue-200";
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${cls}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
