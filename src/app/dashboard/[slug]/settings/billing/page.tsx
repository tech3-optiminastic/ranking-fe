"use client";

import { useEffect, useState } from "react";
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
  Zap,
  Crown,
  Rocket,
  AlertTriangle,
  ArrowUpRight,
} from "@/components/icons";
import { EngineBadge } from "@/components/ui/engine-badge";
import { engineLabel } from "@/lib/engines";
import { config } from "@/lib/config";
import { DashboardSettingsNav } from "@/components/settings/dashboard-settings-nav";
import { BillingSkeleton } from "@/components/dashboard/skeletons";
import {
  BTN_PRIMARY,
  Dot,
  FieldRow,
  SettingsCard,
  StatusPill,
} from "@/components/settings/settings-card";
import { cn } from "@/lib/utils";

const PLAN_ICONS: Record<string, typeof Zap> = {
  starter: Zap,
  pro: Crown,
  business: Rocket,
};

function UsageBar({ used, max, atLimit }: { used: number; max: number; atLimit: boolean }) {
  const pct = max > 0 ? Math.min((used / max) * 100, 100) : 0;
  const warn = pct >= 80 && !atLimit;
  const barColor = atLimit ? "bg-rose-500" : warn ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="font-medium tabular-nums text-neutral-900">
          {used} <span className="text-neutral-400">/ {max}</span>
        </span>
        {atLimit ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600">
            <AlertTriangle className="h-3 w-3" /> Limit reached
          </span>
        ) : warn ? (
          <span className="text-[11px] font-medium text-amber-600">{Math.round(pct)}% used</span>
        ) : (
          <span className="text-[11px] text-neutral-400">{Math.round(pct)}% used</span>
        )}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
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

      <div className="mb-8 mt-5">
        <h2 className="text-[22px] font-semibold tracking-tight text-neutral-900">
          Billing &amp; usage
        </h2>
        <p className="mt-1.5 text-[13.5px] font-light leading-relaxed text-neutral-500">
          Your subscription, plan limits, and recent invoices.
        </p>
      </div>

      {loading ? (
        <BillingSkeleton />
      ) : (
        <div className="space-y-8">
          {/* ── Subscription ──────────────────────────────────────────── */}
          <SettingsCard>
            <SettingsCard.Header
              title="Subscription"
              description="Your current plan and renewal date."
              action={
                sub?.is_active ? (
                  <StatusPill tone="emerald">
                    <Dot tone="emerald" />
                    Active
                  </StatusPill>
                ) : (
                  <Link href="/pricing" className={BTN_PRIMARY}>
                    <CreditCard className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Choose a plan
                  </Link>
                )
              }
            />

            <SettingsCard.Body divided>
              <FieldRow
                label="Plan"
                helper="Determines projects, prompt cap, and which AI engines are included."
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md border border-black/8 bg-gradient-to-b from-white to-neutral-50 text-primary shadow-sm">
                    <PlanIcon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold tracking-tight text-neutral-900">
                      {sub?.plan_label || "Starter"}
                    </p>
                    <p className="text-[11.5px] text-neutral-500">
                      {sub?.is_active ? "Active subscription" : "Free tier"}
                    </p>
                  </div>
                </div>
              </FieldRow>

              {renewsDate ? (
                <FieldRow
                  label="Next billing date"
                  helper="The next time your card will be charged."
                >
                  <p className="text-[13.5px] font-medium text-neutral-900">{renewsDate}</p>
                </FieldRow>
              ) : null}

              <FieldRow
                label="AI engines"
                helper="Engines marked unavailable require a higher plan."
              >
                <div className="flex flex-wrap gap-1.5">
                  {["gemini", "google", "chatgpt", "perplexity", "claude"].map((eng) => {
                    const allowed = sub?.limits?.engines.includes(eng) ?? false;
                    return (
                      <span
                        key={eng}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11.5px] font-medium tracking-tight transition-colors",
                          allowed
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-black/8 bg-neutral-50 text-neutral-400 line-through",
                        )}
                      >
                        <EngineBadge engine={eng} size={14} showLabel={false} />
                        {engineLabel(eng)}
                      </span>
                    );
                  })}
                </div>
              </FieldRow>
            </SettingsCard.Body>

            {sub?.is_active && sub.plan !== "business" ? (
              <SettingsCard.Footer>
                <p className="text-[12.5px] text-neutral-500">
                  {atAnyLimit
                    ? "You've hit your plan limit. Upgrade to keep going."
                    : "Need more projects, prompts, or engines?"}
                </p>
                <Link href="/pricing" className={BTN_PRIMARY}>
                  <Rocket className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Upgrade
                </Link>
              </SettingsCard.Footer>
            ) : null}
          </SettingsCard>

          {/* ── Usage ─────────────────────────────────────────────────── */}
          {usage ? (
            <SettingsCard>
              <SettingsCard.Header
                title="Usage this period"
                description="Counts reset on your next billing date."
                action={
                  atAnyLimit ? (
                    <StatusPill tone="rose">
                      <AlertTriangle className="h-3 w-3" /> At limit
                    </StatusPill>
                  ) : null
                }
              />

              <SettingsCard.Body divided>
                <FieldRow
                  label="Projects"
                  helper="Each project is a workspace with its own scoring runs and prompts."
                >
                  <UsageBar
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
                    used={usage.usage.prompts}
                    max={usage.limits.max_prompts}
                    atLimit={usage.at_limit.prompts}
                  />
                </FieldRow>

                <FieldRow
                  label="Analysis runs"
                  helper="Scans completed since your last billing date."
                >
                  <p className="text-[20px] font-semibold tabular-nums tracking-tight text-neutral-900">
                    {usage.usage.runs_this_month}
                  </p>
                </FieldRow>
              </SettingsCard.Body>
            </SettingsCard>
          ) : null}

          {/* ── Plan features ─────────────────────────────────────────── */}
          {sub?.is_active && sub.limits ? (
            <SettingsCard>
              <SettingsCard.Header
                title={`What's included in ${sub.plan_label}`}
                description="Everything your plan ships with."
              />
              <SettingsCard.Body>
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
                    <div key={f} className="flex items-start gap-2">
                      <CheckCircle2
                        className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                        strokeWidth={2}
                      />
                      <span className="text-[13px] leading-snug text-neutral-700">{f}</span>
                    </div>
                  ))}
                </div>
              </SettingsCard.Body>
            </SettingsCard>
          ) : null}

          {/* ── Invoices ──────────────────────────────────────────────── */}
          {sub?.is_active && email ? <InvoicesSection email={email} /> : null}

          <p className="pt-2 text-center text-[11.5px] font-light text-neutral-400">
            Payments are processed securely by Dodo Payments. Cancel anytime.
          </p>
        </div>
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
    <SettingsCard>
      <SettingsCard.Header
        title="Invoices"
        description="Download a PDF receipt for any successful payment."
      />
      <SettingsCard.Body>
        {isLoading ? (
          <p className="py-6 text-center text-[12.5px] font-light text-neutral-500">
            Loading invoices…
          </p>
        ) : error ? (
          <p className="py-6 text-center text-[12.5px] font-light text-neutral-500">
            Could not load invoices right now. Try again in a moment.
          </p>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-black/8 bg-neutral-50 text-neutral-400">
              <FileDown className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <p className="text-[12.5px] font-medium text-neutral-700">No invoices yet</p>
            <p className="text-[12px] font-light text-neutral-500">
              They&rsquo;ll appear here after your first successful charge.
            </p>
          </div>
        ) : (
          <div className="-mx-6 -my-5 overflow-hidden">
            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-black/8 bg-neutral-50/60 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-neutral-500">
                <tr>
                  <th className="px-6 py-2.5">Date</th>
                  <th className="px-3 py-2.5">Amount</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-6 py-2.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6">
                {items.map((row) => (
                  <tr key={row.payment_id} className="transition-colors hover:bg-neutral-50/40">
                    <td className="px-6 py-3 text-neutral-900">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-3 py-3 font-medium tabular-nums text-neutral-900">
                      {row.amount != null
                        ? `${row.currency ?? ""} ${row.amount.toFixed(2)}`.trim()
                        : "—"}
                    </td>
                    <td className="px-3 py-3">
                      <InvoiceStatusPill status={row.status} />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <a
                        href={`${config.apiBaseUrl}/api/payments/invoice/?email=${encodeURIComponent(email)}&payment_id=${encodeURIComponent(row.payment_id)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-black/8 bg-white px-2.5 py-1.5 text-[11.5px] font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 hover:text-neutral-900"
                      >
                        <FileDown className="h-3.5 w-3.5" strokeWidth={1.75} />
                        PDF
                        <ArrowUpRight className="h-3 w-3 text-neutral-400" strokeWidth={1.75} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SettingsCard.Body>
    </SettingsCard>
  );
}

function InvoiceStatusPill({ status }: { status: string | null }) {
  if (!status) return <span className="text-neutral-400">—</span>;
  const s = status.toLowerCase();
  if (s === "succeeded" || s === "paid" || s === "completed") {
    return (
      <StatusPill tone="emerald">
        <Dot tone="emerald" /> Paid
      </StatusPill>
    );
  }
  if (s === "failed" || s === "declined") {
    return (
      <StatusPill tone="rose">
        <Dot tone="rose" /> {status}
      </StatusPill>
    );
  }
  if (s === "refunded" || s === "partially_refunded") {
    return <StatusPill tone="amber">{status.replace(/_/g, " ")}</StatusPill>;
  }
  if (s === "pending" || s === "processing") {
    return (
      <StatusPill tone="amber">
        <Dot tone="amber" /> {status}
      </StatusPill>
    );
  }
  return <StatusPill tone="neutral">{status.replace(/_/g, " ")}</StatusPill>;
}
