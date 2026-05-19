"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import { getReferralMe } from "@/lib/api/referrals";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Copy, Sparkles, AlertCircle } from "@/components/icons";
import { DashboardSettingsNav } from "@/components/settings/dashboard-settings-nav";
import { cn } from "@/lib/utils";

const SITE_BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://signalor.ai";

const CARD = "rounded-lg border border-black/8 bg-white shadow-sm";
const CARD_HEADER = "border-b border-black/8 px-6 py-4";
const CARD_TITLE = "text-[13px] font-semibold tracking-tight text-neutral-900";
const CARD_SUBTITLE = "mt-0.5 text-[12px] font-light text-neutral-500";

const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-neutral-900 px-4 py-2 text-[12px] font-semibold tracking-tight text-white shadow-sm transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50";

const BTN_OUTLINE =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-black/12 bg-white px-4 py-2 text-[12px] font-semibold tracking-tight text-neutral-900 shadow-sm transition hover:bg-neutral-50";

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

      <div className="mt-4 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900">Refer &amp; earn</h2>
        <p className="mt-1 text-[13px] font-light leading-relaxed text-neutral-500">
          Share your referral link. When someone subscribes through it,{" "}
          <strong className="font-semibold text-neutral-900">they get 10%</strong> off their first
          payment and <strong className="font-semibold text-neutral-900">you get 20%</strong> off
          your next billing cycle.
        </p>
      </div>

      {loading && !data ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : error ? (
        <div className="flex items-start gap-2 rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-[13px] text-rose-700">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{error instanceof Error ? error.message : "Failed to load referrals"}</span>
        </div>
      ) : data ? (
        <>
          {/* ── Share link card ──────────────────────────────────────── */}
          <div className={CARD}>
            <div className={CARD_HEADER}>
              <p className={CARD_TITLE}>Your referral link</p>
              <p className={CARD_SUBTITLE}>
                Send this to friends and earn discounts when they subscribe.
              </p>
            </div>

            <div className="divide-y divide-black/8 px-6">
              <FieldRow
                label="Share URL"
                helper="Anyone who signs up through this link is credited to you for 30 days."
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-md border border-black/10 bg-neutral-50 px-3 py-2 text-[13px] text-neutral-900">
                    {shareUrl}
                  </code>
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
                helper="Short code embedded in the link above. Useful if you want to share it verbally."
              >
                <span className="inline-block rounded-md border border-black/10 bg-neutral-50 px-3 py-1.5 font-mono text-[13px] font-semibold tracking-tight text-neutral-900">
                  {data.code}
                </span>
              </FieldRow>
            </div>
          </div>

          {/* ── Pending reward callout ──────────────────────────────── */}
          {data.stats.pending_reward ? (
            <div className="mt-6 flex items-center gap-3 rounded-md border border-primary/20 bg-primary/5 px-4 py-3 text-[13px] text-primary">
              <Sparkles className="size-4 shrink-0" />
              <span>
                You have{" "}
                <strong className="font-semibold">
                  {data.stats.pending_reward.percent_off}% off
                </strong>{" "}
                staged for your next billing cycle.
              </span>
            </div>
          ) : null}

          {/* ── Stats ────────────────────────────────────────────────── */}
          <div className={cn(CARD, "mt-6")}>
            <div className={CARD_HEADER}>
              <p className={CARD_TITLE}>Performance</p>
              <p className={CARD_SUBTITLE}>
                Lifetime totals across every referral you&rsquo;ve sent.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-px border-t border-black/8 bg-black/8 sm:grid-cols-4">
              <StatTile label="Total invites" value={data.stats.total} />
              <StatTile label="Pending" value={data.stats.pending} tone="muted" />
              <StatTile label="Subscribed" value={data.stats.paid} tone="positive" />
              <StatTile
                label="Discounts earned"
                value={data.stats.rewards_applied}
                tone="primary"
              />
            </div>
          </div>

          {/* ── Recent referrals ─────────────────────────────────────── */}
          <div className={cn(CARD, "mt-6")}>
            <div className={CARD_HEADER}>
              <p className={CARD_TITLE}>Recent referrals</p>
              <p className={CARD_SUBTITLE}>People who&rsquo;ve clicked your link or signed up.</p>
            </div>

            <div className="px-6 py-4">
              {data.referrals.length === 0 ? (
                <p className="py-6 text-center text-[12px] font-light text-neutral-500">
                  No referrals yet. Share your link to get started.
                </p>
              ) : (
                <div className="overflow-hidden rounded-md border border-black/8">
                  <table className="w-full text-left text-[12px]">
                    <thead className="border-b border-black/8 bg-neutral-50 text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                      <tr>
                        <th className="px-3 py-2">Email</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Joined</th>
                        <th className="px-3 py-2">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.referrals.map((r) => (
                        <tr key={r.referee_email} className="border-b border-black/8 last:border-0">
                          <td className="px-3 py-2.5 font-medium text-neutral-900">
                            {r.referee_email}
                          </td>
                          <td className="px-3 py-2.5">
                            <StatusPill status={r.status} />
                          </td>
                          <td className="px-3 py-2.5 text-neutral-500">
                            {new Date(r.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-3 py-2.5 text-neutral-500">
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
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "muted" | "positive" | "primary";
}) {
  return (
    <div className="bg-white px-4 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-2xl font-bold tabular-nums",
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

function StatusPill({ status }: { status: "pending" | "paid" | "cancelled" }) {
  const styles =
    status === "paid"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "cancelled"
        ? "border-rose-200 bg-rose-50 text-rose-700"
        : "border-black/10 bg-neutral-50 text-neutral-500";
  const label = status === "paid" ? "Subscribed" : status === "cancelled" ? "Cancelled" : "Pending";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        styles,
      )}
    >
      {label}
    </span>
  );
}
