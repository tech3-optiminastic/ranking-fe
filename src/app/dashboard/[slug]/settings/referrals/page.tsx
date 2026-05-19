"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { getReferralMe } from "@/lib/api/referrals";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Copy, Sparkles, AlertCircle, Gift } from "@/components/icons";
import { DashboardSettingsNav } from "@/components/settings/dashboard-settings-nav";
import {
  BTN_OUTLINE,
  BTN_PRIMARY,
  Dot,
  FieldRow,
  SettingsCard,
  StatusPill,
} from "@/components/settings/settings-card";
import { cn } from "@/lib/utils";

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://signalor.ai";

export default function ReferralsSettingsPage() {
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";

  const [copied, setCopied] = useState(false);

  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["referral-me", email],
    queryFn: () => getReferralMe(email),
    enabled: !!email,
  });

  const shareUrl = useMemo(() => {
    if (!data?.code) return "";
    return `${SITE_BASE}/?ref=${data.code}`;
  }, [data?.code]);

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="px-2 py-2 font-sans">
      <DashboardSettingsNav label="Referrals" />

      <div className="mb-8 mt-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-semibold tracking-tight text-neutral-900">
            Refer &amp; earn
          </h2>
          <p className="mt-1.5 max-w-2xl text-[13.5px] font-light leading-relaxed text-neutral-500">
            Share your referral link. When someone subscribes through it,{" "}
            <strong className="font-medium text-neutral-900">they get 10% off</strong> their first
            payment and <strong className="font-medium text-neutral-900">you get 20% off</strong>{" "}
            your next billing cycle.
          </p>
        </div>
        <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/15 bg-primary/5 text-primary md:inline-flex">
          <Gift className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </div>

      {loading && !data ? (
        <Skeleton className="h-44 w-full rounded-xl" />
      ) : error ? (
        <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error instanceof Error ? error.message : "Failed to load referrals"}</span>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* ── Share link ───────────────────────────────────────────── */}
          <SettingsCard>
            <SettingsCard.Header
              title="Your referral link"
              description="Send this anywhere — Slack, email, X. We track signups for 30 days."
            />

            <SettingsCard.Body divided>
              <FieldRow
                label="Share URL"
                helper="Anyone who signs up through this link is credited to you."
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex-1 overflow-x-auto rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-[12.5px] text-neutral-700">
                    <span className="text-neutral-400">
                      {SITE_BASE.replace(/^https?:\/\//, "")}
                    </span>
                    /?ref=
                    <span className="font-semibold text-neutral-900">{data.code}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className={copied ? BTN_OUTLINE : BTN_PRIMARY}
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" /> Copy link
                      </>
                    )}
                  </button>
                </div>
              </FieldRow>

              <FieldRow
                label="Referral code"
                helper="Short code embedded in the link above. Useful for verbal sharing."
              >
                <span className="inline-flex items-center gap-1.5">
                  <span className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-1.5 font-mono text-[13px] font-semibold tracking-tight text-neutral-900">
                    {data.code}
                  </span>
                </span>
              </FieldRow>
            </SettingsCard.Body>
          </SettingsCard>

          {/* ── Pending reward callout ──────────────────────────────── */}
          {data.stats.pending_reward ? (
            <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-gradient-to-r from-primary/[0.06] to-primary/[0.02] px-4 py-3.5 text-[13px] text-primary">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-4" />
              </span>
              <span className="leading-snug">
                You have{" "}
                <strong className="font-semibold">
                  {data.stats.pending_reward.percent_off}% off
                </strong>{" "}
                staged for your next billing cycle.
              </span>
            </div>
          ) : null}

          {/* ── Stats ────────────────────────────────────────────────── */}
          <SettingsCard>
            <SettingsCard.Header
              title="Performance"
              description="Lifetime totals across every referral you've sent."
            />

            <div className="grid grid-cols-2 divide-x divide-y divide-neutral-200 sm:grid-cols-4 sm:divide-y-0">
              <StatTile label="Total invites" value={data.stats.total} />
              <StatTile label="Pending" value={data.stats.pending} tone="muted" />
              <StatTile label="Subscribed" value={data.stats.paid} tone="positive" indicator />
              <StatTile label="Rewards earned" value={data.stats.rewards_applied} tone="primary" />
            </div>
          </SettingsCard>

          {/* ── Recent referrals ─────────────────────────────────────── */}
          <SettingsCard>
            <SettingsCard.Header
              title="Recent referrals"
              description="People who've clicked your link or signed up."
            />

            <SettingsCard.Body>
              {data.referrals.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-400">
                    <Gift className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <p className="text-[12.5px] font-medium text-neutral-700">No referrals yet</p>
                  <p className="max-w-xs text-[12px] font-light text-neutral-500">
                    Share your link with friends and they&rsquo;ll appear here once they sign up.
                  </p>
                </div>
              ) : (
                <div className="-mx-6 -my-5 overflow-hidden">
                  <table className="w-full text-left text-[12.5px]">
                    <thead className="border-b border-neutral-200 bg-neutral-50/60 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-neutral-500">
                      <tr>
                        <th className="px-6 py-2.5">Email</th>
                        <th className="px-3 py-2.5">Status</th>
                        <th className="px-3 py-2.5">Joined</th>
                        <th className="px-6 py-2.5">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {data.referrals.map((r) => (
                        <tr
                          key={r.referee_email}
                          className="transition-colors hover:bg-neutral-50/40"
                        >
                          <td className="px-6 py-3 font-medium text-neutral-900">
                            {r.referee_email}
                          </td>
                          <td className="px-3 py-3">
                            <ReferralStatusPill status={r.status} />
                          </td>
                          <td className="px-3 py-3 text-neutral-500">
                            {new Date(r.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-3 text-neutral-500">
                            {r.paid_at
                              ? new Date(r.paid_at).toLocaleDateString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SettingsCard.Body>
          </SettingsCard>
        </div>
      ) : null}
    </div>
  );
}

function StatTile({
  label,
  value,
  tone = "default",
  indicator = false,
}: {
  label: string;
  value: number;
  tone?: "default" | "muted" | "positive" | "primary";
  indicator?: boolean;
}) {
  return (
    <div className="px-5 py-5">
      <p className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
        {indicator ? <Dot tone="emerald" /> : null}
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-[26px] font-semibold leading-none tabular-nums tracking-tight",
          tone === "positive" && "text-emerald-600",
          tone === "primary" && "text-primary",
          tone === "muted" && "text-neutral-400",
          tone === "default" && "text-neutral-900",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function ReferralStatusPill({ status }: { status: "pending" | "paid" | "cancelled" }) {
  if (status === "paid") {
    return (
      <StatusPill tone="emerald">
        <Dot tone="emerald" /> Subscribed
      </StatusPill>
    );
  }
  if (status === "cancelled") {
    return <StatusPill tone="rose">Cancelled</StatusPill>;
  }
  return (
    <StatusPill tone="neutral">
      <Dot tone="neutral" /> Pending
    </StatusPill>
  );
}
