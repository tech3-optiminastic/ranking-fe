"use client";

import { useState } from "react";
import Link from "next/link";
import { useCreator } from "./_components/creator-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { flagEmoji } from "@/lib/countries";
import { Check, Copy, ExternalLink, Loader2 } from "@/components/icons";
import type { CommissionRow } from "@/lib/api/partners-program";

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function CopyPill({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1200);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-semibold text-foreground hover:bg-muted"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : label || "Copy"}
    </button>
  );
}

function StatTile({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper?: string;
  tone?: "neutral" | "sky" | "amber" | "emerald" | "violet";
}) {
  const toneClass =
    tone === "sky"
      ? "text-sky-700 dark:text-sky-300"
      : tone === "amber"
        ? "text-amber-700 dark:text-amber-300"
        : tone === "emerald"
          ? "text-emerald-700 dark:text-emerald-300"
          : tone === "violet"
            ? "text-violet-700 dark:text-violet-300"
            : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={cn("mt-1 text-2xl font-semibold tabular-nums", toneClass)}>{value}</p>
      {helper ? <p className="mt-0.5 text-[11px] text-muted-foreground">{helper}</p> : null}
    </div>
  );
}

function StatusPill({ row }: { row: CommissionRow }) {
  if (row.bucket === "paid") {
    return (
      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        Paid
      </span>
    );
  }
  if (row.bucket === "locked") {
    return (
      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">
        Locked
      </span>
    );
  }
  return (
    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
      Pending
    </span>
  );
}

export default function CreatorDashboardOverviewPage() {
  const { profile, loading } = useCreator();

  if (loading || !profile) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { stats } = profile;
  const totalEarned = stats.paid.amount + stats.locked.amount;
  const allClaims = stats.paid.count + stats.locked.count + stats.pending.count;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Hi {profile.name || "creator"}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
            {profile.country ? (
              <span className="inline-flex items-center gap-1">
                <span className="text-base leading-none">{flagEmoji(profile.country)}</span>
                {profile.country}
              </span>
            ) : null}
            <span>·</span>
            <span>{profile.commission_percent}% commission</span>
            <span>·</span>
            <span className="capitalize">{profile.status}</span>
          </p>
        </div>
        <Link
          href={`/creators-program/${profile.code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-semibold text-foreground hover:bg-muted"
        >
          View public page
          <ExternalLink className="size-3.5" />
        </Link>
      </div>

      {/* Share link */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Your share link
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Anyone who lands on Signalor through this link gets 10% off. You earn{" "}
              {profile.commission_percent}% of their first paid invoice.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded-md border border-border bg-background px-3 py-2 font-mono text-[13px] text-foreground">
            {profile.share_url}
          </code>
          <CopyPill value={profile.share_url} label="Copy link" />
          <CopyPill value={profile.code} label="Copy code" />
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile
          label="Attributions"
          value={stats.attributions_total.toString()}
          helper={`${stats.attributions_active} active`}
        />
        <StatTile
          label="Pending"
          value={stats.pending.count.toString()}
          helper={formatMoney(stats.pending.amount, "USD")}
          tone="amber"
        />
        <StatTile
          label="Locked"
          value={stats.locked.count.toString()}
          helper={formatMoney(stats.locked.amount, "USD")}
          tone="sky"
        />
        <StatTile
          label="Paid"
          value={stats.paid.count.toString()}
          helper={formatMoney(stats.paid.amount, "USD")}
          tone="emerald"
        />
        <StatTile
          label="Total earned"
          value={formatMoney(totalEarned, "USD")}
          helper={`${allClaims} commission${allClaims === 1 ? "" : "s"}`}
          tone="violet"
        />
      </div>

      {/* Recent commissions */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="text-[13px] font-semibold text-foreground">Recent commissions</p>
          <p className="text-[11px] text-muted-foreground">
            {stats.recent_commissions.length} shown · 30-day refund window
          </p>
        </div>
        {stats.recent_commissions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[13px] font-medium text-foreground">No commissions yet</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Share your link to start earning. Commissions land here within minutes of a paid
              signup.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="border-b border-border">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-2">Date</th>
                  <th className="px-5 py-2">Referee</th>
                  <th className="px-5 py-2 text-right">Amount</th>
                  <th className="px-5 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_commissions.map((row) => (
                  <tr
                    key={`${row.created_at}-${row.referee_email}`}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-5 py-3 tabular-nums text-muted-foreground">
                      {new Date(row.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      })}
                    </td>
                    <td className="px-5 py-3 font-mono text-[12px] text-foreground">
                      {row.referee_email}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums text-foreground">
                      {formatMoney(row.commission_amount, row.currency)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Help footer */}
      <div className="rounded-xl border border-border bg-muted/40 p-5 text-[12px] text-muted-foreground">
        <p>
          Need to update your payout details or socials?{" "}
          <Link
            href="/creator-dashboard/settings"
            className="font-semibold text-foreground underline decoration-neutral-300 underline-offset-2 hover:decoration-foreground"
          >
            Edit profile
          </Link>
          . Questions about a specific commission? Email{" "}
          <a
            href="mailto:creators@signalor.ai"
            className="font-semibold text-foreground underline decoration-neutral-300 underline-offset-2 hover:decoration-foreground"
          >
            creators@signalor.ai
          </a>
          .
        </p>
      </div>
    </div>
  );
}
