"use client";

import type { DashboardSentiment } from "./types";

const R = 40;
const CX = 56;
const CY = 56;
const C = 2 * Math.PI * R; // ≈ 251.3
const GAP = 4; // gap in px between segments

function scoreLabel(score: number) {
  if (score >= 5) return "Very Positive";
  if (score >= 1) return "Positive";
  if (score === 0) return "Neutral";
  if (score >= -4) return "Negative";
  return "Very Negative";
}

function scoreColor(score: number) {
  if (score > 0) return "#22c55e";
  if (score < 0) return "var(--primary)";
  return "#6b7280";
}

export function SentimentAnalysisCard({ sentiment }: { sentiment: DashboardSentiment | null }) {
  const total = sentiment?.totalMentions ?? 0;
  const positive = sentiment?.positive ?? 0;
  const neutral = sentiment?.neutral ?? 0;
  const negative = sentiment?.negative ?? 0;
  const score = sentiment?.score ?? 0;

  // Arc lengths — subtract GAP so segments have breathing room
  const posArc = total > 0 ? Math.max(0, (positive / total) * C - GAP) : 0;
  const neuArc = total > 0 ? Math.max(0, (neutral / total) * C - GAP) : 0;
  const negArc = total > 0 ? Math.max(0, (negative / total) * C - GAP) : 0;

  // Negative dashoffset = shift segment start clockwise (forward along the path)
  const posOffset = 0;
  const neuOffset = -(posArc + GAP);
  const negOffset = -(posArc + GAP + neuArc + GAP);

  const posPct = total > 0 ? Math.round((positive / total) * 100) : 0;
  const neuPct = total > 0 ? Math.round((neutral / total) * 100) : 0;
  const negPct = total > 0 ? Math.round((negative / total) * 100) : 0;

  const aiMentioned = sentiment?.aiMentioned ?? 0;
  const aiTotal = sentiment?.aiTotal ?? 0;
  const aiPct = aiTotal > 0 ? Math.round((aiMentioned / aiTotal) * 100) : 0;

  return (
    <div className="flex h-full min-h-0 w-full flex-col rounded-xl border border-neutral-100 bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)]">
      <div className="mb-3 shrink-0">
        <p className="text-sm font-semibold text-foreground">Sentiment Analysis</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">Brand perception across mentions</p>
      </div>

      {sentiment ? (
        <div className="flex flex-1 flex-col items-center justify-between gap-3">
          {/* Donut chart with centered score */}
          <div className="relative flex shrink-0 items-center justify-center">
            <svg width="112" height="112" viewBox="0 0 112 112" aria-hidden>
              {/* rotate -90 so arcs start at 12 o'clock */}
              <g transform={`rotate(-90 ${CX} ${CY})`}>
                {/* Track ring */}
                <circle cx={CX} cy={CY} r={R} fill="none" stroke="#f3f4f6" strokeWidth="12" />
                {total > 0 ? (
                  <>
                    {/* Positive — green */}
                    <circle
                      cx={CX}
                      cy={CY}
                      r={R}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="12"
                      strokeLinecap="butt"
                      strokeDasharray={`${posArc} ${C}`}
                      strokeDashoffset={posOffset}
                    />
                    {/* Neutral — gray */}
                    <circle
                      cx={CX}
                      cy={CY}
                      r={R}
                      fill="none"
                      stroke="#d1d5db"
                      strokeWidth="12"
                      strokeLinecap="butt"
                      strokeDasharray={`${neuArc} ${C}`}
                      strokeDashoffset={neuOffset}
                    />
                    {/* Negative — primary red */}
                    <circle
                      cx={CX}
                      cy={CY}
                      r={R}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth="12"
                      strokeLinecap="butt"
                      strokeDasharray={`${negArc} ${C}`}
                      strokeDashoffset={negOffset}
                    />
                  </>
                ) : null}
              </g>
            </svg>

            {/* Centered score label (not rotated — sits on top of SVG) */}
            <div className="absolute flex flex-col items-center">
              <span
                className="text-2xl font-bold leading-none tabular-nums"
                style={{ color: scoreColor(score) }}
              >
                {score > 0 ? "+" : ""}
                {score}
              </span>
              <span className="mt-1 text-[10px] leading-none text-muted-foreground">
                {scoreLabel(score)}
              </span>
            </div>
          </div>

          {/* Breakdown strip */}
          <div className="flex w-full items-stretch justify-between gap-1 rounded-lg border border-neutral-100 bg-neutral-50/80 px-3 py-2.5">
            <div className="flex flex-1 flex-col items-center gap-0.5">
              <span className="text-xs font-bold tabular-nums text-emerald-600">{posPct}%</span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-muted-foreground">Positive</span>
              </div>
            </div>
            <div className="w-px self-stretch bg-neutral-200" />
            <div className="flex flex-1 flex-col items-center gap-0.5">
              <span className="text-xs font-bold tabular-nums text-muted-foreground">
                {neuPct}%
              </span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                <span className="text-[10px] text-muted-foreground">Neutral</span>
              </div>
            </div>
            <div className="w-px self-stretch bg-neutral-200" />
            <div className="flex flex-1 flex-col items-center gap-0.5">
              <span className="text-xs font-bold tabular-nums text-primary">{negPct}%</span>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-[10px] text-muted-foreground">Negative</span>
              </div>
            </div>
          </div>

          {/* AI probe footer */}
          <div className="flex w-full items-center justify-between border-t border-border pt-2">
            <span className="text-[11px] text-muted-foreground">AI probe mentions</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-foreground">
                {aiMentioned}/{aiTotal}
              </span>
              {aiTotal > 0 && <span className="text-[10px] text-muted-foreground">({aiPct}%)</span>}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xs text-muted-foreground">No sentiment data available yet</p>
        </div>
      )}
    </div>
  );
}
