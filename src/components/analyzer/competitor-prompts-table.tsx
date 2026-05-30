"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "@/components/icons";
import {
  getCompetitorPrompts,
  type CompetitorPrompt,
  type CompetitorMention,
} from "@/lib/api/analyzer";

// ── Helpers ──────────────────────────────────────────────────────────────────

function hostOf(url: string): string {
  if (!url) return "";
  try {
    const u = new URL(url.includes("://") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^www\./, "").split("/")[0];
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BrandLogo({ url, name, size = 22 }: { url: string; name: string; size?: number }) {
  const host = hostOf(url);
  const [failed, setFailed] = useState(false);
  const src = host ? `https://www.google.com/s2/favicons?domain=${host}&sz=${size * 2}` : "";

  if (!host || failed) {
    return (
      <div
        title={name}
        className="flex shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/50 text-[9px] font-bold text-muted-foreground uppercase"
        style={{ width: size, height: size }}
      >
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      title={name}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      className="shrink-0 rounded-full border border-border/40 object-contain"
      style={{ width: size, height: size }}
    />
  );
}

function ColHeader({ label, tip }: { label: string; tip: string }) {
  return (
    <div className="group relative inline-flex cursor-default items-center">
      <span>{label}</span>
      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-[11px] leading-tight text-background opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
        {tip}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground" />
      </div>
    </div>
  );
}

function CircleProgress({ pct, size = 28 }: { pct: number; size?: number }) {
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 60 ? "#22c55e" : pct >= 30 ? "#f59e0b" : "#e5e7eb";

  return (
    <svg width={size} height={size} className="shrink-0" style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={2.5} />
      {pct > 0 && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

function ScoreBars({ value, color = "#f59e0b" }: { value: number; color?: string }) {
  const bars = 5;
  const filled = Math.round((value / 1) * bars);
  return (
    <div className="flex items-end gap-[2px]">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="rounded-[1px]"
          style={{
            width: 4,
            height: 6 + i * 2,
            backgroundColor: i < filled ? color : "#e5e7eb",
          }}
        />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface CompetitorPromptsTableProps {
  slug: string;
  competitors: Array<{ id: number; name: string; url: string }>;
  yourUrl?: string;
  yourName?: string;
}

export function CompetitorPromptsTable({
  slug,
  competitors,
  yourUrl,
  yourName,
}: CompetitorPromptsTableProps) {
  const [prompts, setPrompts] = useState<CompetitorPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCount = useRef(0);

  const load = useCallback(async () => {
    try {
      const data = await getCompetitorPrompts(slug);
      setPrompts(data);
    } catch {
      // silently keep previous data
    }
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    getCompetitorPrompts(slug)
      .then((data) => setPrompts(data))
      .catch(() => setError("Failed to load competitive prompts."))
      .finally(() => setLoading(false));
  }, [slug]);

  // Poll every 6 s while prompts are empty (waiting for generation) or any row has no results yet.
  // Stop after 20 attempts (~2 min) so we don't poll indefinitely on old runs.
  useEffect(() => {
    const hasPending = prompts.length === 0 || prompts.some((p) => p.results.length === 0);
    if (!hasPending || pollCount.current >= 20) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(() => {
      pollCount.current += 1;
      void load();
    }, 6000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [prompts, load]);

  const isEmpty = !loading && prompts.length === 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-base font-semibold text-foreground">Competitive Prompt Insights</h3>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          AI-generated prompts where competitor brands are likely mentioned in responses.
        </p>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-muted/40" />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 py-10 text-center">
          <p className="text-sm font-medium text-foreground">No competitive prompts yet</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Competitive prompts are generated automatically after brand analysis completes.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/70">
          <table className="w-full table-fixed text-[13px]">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30">
                {(
                  [
                    [
                      "Average Visibility",
                      "How often your brand appears across AI responses",
                      "w-[130px]",
                    ],
                    ["Prompt", "The search query fired to AI engines", ""],
                    ["Volume", "Estimated search frequency for this query", "w-[90px]"],
                    ["Difficulty", "How competitive this prompt is to rank for", "w-[90px]"],
                    ["Brand Mentions", "Brands detected in AI response text", "w-[160px]"],
                    ["Tags", "Prompt categories and labels", "w-[80px]"],
                    ["Created", "Date this prompt was generated", "w-[80px]"],
                  ] as [string, string, string][]
                ).map(([label, tip, cls]) => (
                  <th
                    key={label}
                    className={`px-4 py-2.5 text-left text-[11px] font-medium text-muted-foreground ${cls}`}
                  >
                    <ColHeader label={label} tip={tip} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {prompts.map((p) => {
                const hasResults = p.results.length > 0;
                const visPct = hasResults ? Math.round(p.visibility_pct ?? 0) : 0;
                const competitorMentions = p.mentioned_competitors_detail ?? [];

                // Show user's own brand logo when AI mentioned it in any result
                const ownBrandMentioned =
                  hasResults && yourUrl && yourName && (p.mentions ?? 0) > 0;

                // Build the full brand mentions list: own brand first, then competitors
                const allMentions: Array<{ key: string; url: string; name: string }> = [];
                if (ownBrandMentioned) {
                  allMentions.push({ key: "own", url: yourUrl!, name: yourName! });
                }
                competitorMentions.forEach((m: CompetitorMention) => {
                  allMentions.push({ key: String(m.id), url: m.url, name: m.name });
                });

                return (
                  <tr
                    key={p.id}
                    className="bg-white transition-colors hover:bg-muted/20 dark:bg-white dark:hover:bg-neutral-50/80"
                  >
                    {/* Avg. Vis. */}
                    <td className="px-4 py-3">
                      {!hasResults ? (
                        <Loader2 className="size-5 animate-spin text-muted-foreground/50" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <CircleProgress pct={visPct} />
                          <span
                            className={`text-[12px] font-semibold tabular-nums ${
                              visPct > 0 ? "text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {visPct}%
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Prompt */}
                    <td className="max-w-[300px] px-4 py-3">
                      <p className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground">
                        {p.prompt_text}
                      </p>
                    </td>

                    {/* Volume */}
                    <td className="px-4 py-3">
                      {hasResults ? (
                        <ScoreBars value={p.factor_authority ?? 0} color="#f59e0b" />
                      ) : (
                        <span className="text-[11px] text-muted-foreground/50">—</span>
                      )}
                    </td>

                    {/* Difficulty */}
                    <td className="px-4 py-3">
                      {hasResults ? (
                        <ScoreBars value={p.factor_structural ?? 0} color="#22c55e" />
                      ) : (
                        <span className="text-[11px] text-muted-foreground/50">—</span>
                      )}
                    </td>

                    {/* Brand Mentions */}
                    <td className="px-4 py-3">
                      {!hasResults ? (
                        <Loader2 className="size-4 animate-spin text-muted-foreground/40" />
                      ) : allMentions.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {allMentions.slice(0, 6).map((m) => (
                            <BrandLogo key={m.key} url={m.url} name={m.name} size={22} />
                          ))}
                          {allMentions.length > 6 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{allMentions.length - 6}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-muted-foreground/70">
                          Not mentioned
                        </span>
                      )}
                    </td>

                    {/* Tags */}
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-muted-foreground/50">—</span>
                    </td>

                    {/* Created */}
                    <td className="px-4 py-3 text-[12px] tabular-nums text-muted-foreground">
                      {formatDate(p.created_at)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
