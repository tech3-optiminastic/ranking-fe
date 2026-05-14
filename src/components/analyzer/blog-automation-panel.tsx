"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import TurndownService from "turndown";
import {
  CalendarDays,
  Check,
  Copy,
  FileText,
  Loader2,
  PenSquare,
  Play,
  RefreshCcw,
  Save,
  Send,
  Sparkles,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichEditor } from "@/components/editor/rich-editor";
import { cn } from "@/lib/utils";
import {
  type AIBlogDraft,
  type BlogAutomationConfig,
  type BlogAutomationJob,
  type BlogJobStatus,
  type BlogPublishMode,
  generateAIBlogDraft,
  getBlogAutomationCalendar,
  getBlogAutomationConfig,
  processDueBlogJobs,
  publishAIBlogDraft,
  saveBlogAutomationConfig,
} from "@/lib/api/actions";

interface BlogAutomationPanelProps {
  email: string;
  runId: number;
  analyzedUrl: string;
}

type ComposeMode = "ai" | "manual";

const STATUS_TONE: Record<BlogJobStatus, { bg: string; text: string; border: string }> = {
  published: { bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/25" },
  scheduled: { bg: "bg-sky-500/10", text: "text-sky-600", border: "border-sky-500/25" },
  draft: { bg: "bg-slate-500/10", text: "text-slate-600", border: "border-slate-500/25" },
  needs_review: { bg: "bg-amber-500/10", text: "text-amber-600", border: "border-amber-500/25" },
  failed: { bg: "bg-red-500/10", text: "text-red-600", border: "border-red-500/25" },
};

function prettyStatus(status: BlogJobStatus) {
  return status.replaceAll("_", " ");
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
});

function htmlToMarkdown(html: string): string {
  return turndown.turndown(html || "");
}

function markdownToHtml(md: string): string {
  if (!md) return "";
  const out = marked.parse(md, { async: false }) as string;
  return out;
}

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-card/65 p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
      {children}
    </label>
  );
}

function StatusPill({ status }: { status: BlogJobStatus }) {
  const tone = STATUS_TONE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize",
        tone.bg,
        tone.text,
        tone.border,
      )}
    >
      {prettyStatus(status)}
    </span>
  );
}

export function BlogAutomationPanel({ email, runId, analyzedUrl }: BlogAutomationPanelProps) {
  const [topic, setTopic] = useState("AI search visibility strategy");
  const [keywords, setKeywords] = useState("AI SEO, GEO, llms.txt, robots.txt");
  const [mode, setMode] = useState<BlogPublishMode>("review_before_publish");
  const [frequencyPerDay, setFrequencyPerDay] = useState(1);
  const [publishTime, setPublishTime] = useState("09:00");
  const [isActive, setIsActive] = useState(true);

  const [config, setConfig] = useState<BlogAutomationConfig | null>(null);
  const [jobs, setJobs] = useState<BlogAutomationJob[]>([]);
  const [summary, setSummary] = useState<Record<BlogJobStatus, number>>({
    scheduled: 0,
    draft: 0,
    needs_review: 0,
    published: 0,
    failed: 0,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [publishingJobId, setPublishingJobId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Compose state
  const [composeMode, setComposeMode] = useState<ComposeMode>("ai");
  const [draft, setDraft] = useState<AIBlogDraft | null>(null);
  const [publishing, setPublishing] = useState<"draft" | "publish" | null>(null);
  const [copied, setCopied] = useState(false);

  // Manual write state
  const [manualTitle, setManualTitle] = useState("");
  const [manualMeta, setManualMeta] = useState("");
  const [manualHtml, setManualHtml] = useState("");
  const [manualTags, setManualTags] = useState("");

  const [calendarView, setCalendarView] = useState<"week" | "month">("month");

  const fetchCalendar = useCallback(async () => {
    const cal = await getBlogAutomationCalendar({ email, view: calendarView });
    setJobs(cal.jobs);
    setSummary(cal.summary);
  }, [email, calendarView]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cfg = await getBlogAutomationConfig({
        email,
        run_id: runId,
        analyzed_url: analyzedUrl,
      });
      setConfig(cfg.config);
      setTopic(cfg.config.topic || topic);
      setKeywords((cfg.config.keywords || []).join(", "));
      setMode(cfg.config.mode);
      setFrequencyPerDay(cfg.config.frequency_per_day || 1);
      setPublishTime((cfg.config.publish_time || "09:00").slice(0, 5));
      setIsActive(Boolean(cfg.config.is_active));
      await fetchCalendar();
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Failed to load blog automation.");
    } finally {
      setLoading(false);
    }
  }, [email, runId, analyzedUrl, fetchCalendar, topic]);

  useEffect(() => {
    if (!email) return;
    load();
  }, [email, load]);

  useEffect(() => {
    if (!email) return;
    fetchCalendar().catch(() => {});
  }, [calendarView, email, fetchCalendar]);

  const jobsByDate = useMemo(() => {
    const map: Record<string, BlogAutomationJob[]> = {};
    for (const job of jobs) {
      const key = new Date(job.scheduled_for).toISOString().slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(job);
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [jobs]);

  const totalJobs = useMemo(
    () => Object.values(summary).reduce((sum, n) => sum + (n ?? 0), 0),
    [summary],
  );

  // Build a unified draft object from whichever compose mode is active.
  function buildManualDraft(): AIBlogDraft | null {
    const title = manualTitle.trim();
    if (!title) return null;
    const contentMd = htmlToMarkdown(manualHtml).trim();
    if (!contentMd) return null;
    const tags = manualTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    return {
      title,
      slug: slugify(title),
      meta_description: manualMeta.trim(),
      excerpt: manualMeta.trim().slice(0, 200),
      content_markdown: contentMd,
      tags,
    };
  }

  function loadDraftIntoEditor(d: AIBlogDraft) {
    setManualTitle(d.title || "");
    setManualMeta(d.meta_description || "");
    setManualHtml(markdownToHtml(d.content_markdown || ""));
    setManualTags((d.tags || []).join(", "));
    setComposeMode("manual");
  }

  async function handleSaveConfig() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await saveBlogAutomationConfig({
        email,
        run_id: runId,
        analyzed_url: analyzedUrl,
        topic: topic.trim(),
        keywords,
        frequency_per_day: frequencyPerDay,
        publish_time: publishTime,
        mode,
        is_active: isActive,
      });
      setConfig(res.config);
      setMessage(`Schedule saved. ${res.queued_jobs} jobs queued.`);
      await fetchCalendar();
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Failed to save automation settings.");
    } finally {
      setSaving(false);
    }
  }

  async function handleProcessDue() {
    setProcessing(true);
    setError(null);
    setMessage(null);
    try {
      const res = await processDueBlogJobs(email);
      setMessage(`Processed ${res.processed} due jobs.`);
      await fetchCalendar();
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Failed to process due jobs.");
    } finally {
      setProcessing(false);
    }
  }

  async function handleGenerate(saveAsDraft = false) {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await generateAIBlogDraft({
        email,
        run_id: runId,
        analyzed_url: analyzedUrl,
        topic: topic.trim(),
        keywords,
        save_as_draft: saveAsDraft,
      });
      setDraft(res.draft);
      if (res.draft_job) {
        setMessage("Draft saved to calendar.");
        await fetchCalendar();
      }
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Failed to generate blog draft.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePublishAI(modeType: "draft" | "publish") {
    if (!draft) return;
    setPublishing(modeType);
    setError(null);
    setMessage(null);
    try {
      const res = await publishAIBlogDraft({
        email,
        draft,
        publish_now: modeType === "publish",
        run_id: runId,
        analyzed_url: analyzedUrl,
      });
      setMessage(
        modeType === "publish"
          ? `Published via ${res.provider}.`
          : `Saved CMS draft via ${res.provider}.`,
      );
      await fetchCalendar();
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Failed to publish blog draft.");
    } finally {
      setPublishing(null);
    }
  }

  async function handlePublishManual(modeType: "draft" | "publish") {
    const md = buildManualDraft();
    if (!md) {
      setError("Add a title and some content before publishing.");
      return;
    }
    setPublishing(modeType);
    setError(null);
    setMessage(null);
    try {
      const res = await publishAIBlogDraft({
        email,
        draft: md,
        publish_now: modeType === "publish",
        run_id: runId,
        analyzed_url: analyzedUrl,
      });
      setMessage(
        modeType === "publish"
          ? `Published via ${res.provider}.`
          : `Saved CMS draft via ${res.provider}.`,
      );
      await fetchCalendar();
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Failed to publish post.");
    } finally {
      setPublishing(null);
    }
  }

  async function handlePublishJob(jobId: number) {
    setPublishingJobId(jobId);
    setError(null);
    setMessage(null);
    try {
      const res = await publishAIBlogDraft({
        email,
        draft: {
          title: "",
          slug: "",
          meta_description: "",
          excerpt: "",
          content_markdown: "",
          tags: [],
        },
        publish_now: true,
        job_id: jobId,
      });
      setMessage(`Published scheduled job via ${res.provider}.`);
      await fetchCalendar();
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Failed to publish scheduled job.");
    } finally {
      setPublishingJobId(null);
    }
  }

  async function handleCopyDraft() {
    if (!draft) return;
    const text = [
      `Title: ${draft.title}`,
      `Slug: ${draft.slug}`,
      `Meta: ${draft.meta_description}`,
      "",
      draft.content_markdown,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1000);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <PenSquare className="size-4 text-primary" />
            </span>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              AI Blog Automation
            </h2>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            Generate with AI or write yourself, then publish to your connected CMS.
          </p>
          {config && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 font-medium">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isActive ? "bg-emerald-500" : "bg-neutral-400",
                  )}
                />
                {isActive ? "Active" : "Paused"}
              </span>
              {config.site_url && (
                <span className="truncate">
                  Site · <span className="text-foreground/80">{config.site_url}</span>
                </span>
              )}
              {config.publish_provider && config.publish_provider !== "none" && (
                <span>
                  Publishes to <span className="capitalize text-foreground/80">{config.publish_provider}</span>
                </span>
              )}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => load()}
          disabled={loading}
          className="h-8 gap-1.5 border-border/80 bg-white text-[12px]"
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCcw className="size-3.5" />
          )}
          Refresh
        </Button>
      </div>

      {/* Status strip */}
      <SectionCard className="!p-0 overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-5">
          {(["published", "scheduled", "draft", "needs_review", "failed"] as BlogJobStatus[]).map(
            (key, i) => {
              const tone = STATUS_TONE[key];
              return (
                <div
                  key={key}
                  className={cn(
                    "px-4 py-3 sm:px-5 sm:py-4",
                    i > 0 && "sm:border-l border-border/60",
                    i % 2 === 1 && "border-l sm:border-l border-border/60",
                    i >= 2 && "border-t sm:border-t-0 border-border/60",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={cn("size-1.5 rounded-full", tone.bg.replace("/10", ""))} />
                    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {prettyStatus(key)}
                    </p>
                  </div>
                  <p className="mt-1.5 text-2xl font-semibold tabular-nums text-foreground">
                    {summary[key] ?? 0}
                  </p>
                </div>
              );
            },
          )}
        </div>
      </SectionCard>

      {/* Status messages */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-destructive" />
          {error}
        </div>
      )}
      {message && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          <Check className="mt-0.5 size-4 shrink-0" />
          {message}
        </div>
      )}

      {/* Schedule + Compose two-column layout */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        {/* Schedule card */}
        <SectionCard>
          <div className="mb-4 flex items-center justify-between gap-2">
            <SectionLabel>Schedule</SectionLabel>
            <label className="inline-flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
              <span>Automation</span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
                  isActive ? "bg-emerald-500" : "bg-neutral-300",
                )}
                aria-pressed={isActive}
              >
                <span
                  className={cn(
                    "inline-block size-4 transform rounded-full bg-white shadow-sm transition-transform",
                    isActive ? "translate-x-4" : "translate-x-0.5",
                  )}
                />
              </button>
            </label>
          </div>

          <div className="space-y-3">
            <div>
              <FieldLabel>Topic</FieldLabel>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-9 border-border/80 bg-white text-[13px] focus-visible:border-border focus-visible:ring-0"
                placeholder="AI visibility content strategy"
              />
            </div>
            <div>
              <FieldLabel>Keywords (comma-separated)</FieldLabel>
              <Input
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="h-9 border-border/80 bg-white text-[13px] focus-visible:border-border focus-visible:ring-0"
                placeholder="GEO, answer engines, llms.txt"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <FieldLabel>Per day</FieldLabel>
                <Select
                  value={String(frequencyPerDay)}
                  onValueChange={(v) => setFrequencyPerDay(Number(v))}
                >
                  <SelectTrigger className="h-9 w-full border-border/80 bg-white text-[13px] focus:border-border focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel>Publish at</FieldLabel>
                <Input
                  type="time"
                  value={publishTime}
                  onChange={(e) => setPublishTime(e.target.value)}
                  className="h-9 border-border/80 bg-white text-[13px] focus-visible:border-border focus-visible:ring-0"
                />
              </div>
              <div>
                <FieldLabel>Mode</FieldLabel>
                <Select value={mode} onValueChange={(v) => setMode(v as BlogPublishMode)}>
                  <SelectTrigger className="h-9 w-full border-border/80 bg-white text-[13px] focus:border-border focus:ring-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="review_before_publish">Review</SelectItem>
                    <SelectItem value="auto_publish">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={handleSaveConfig} disabled={saving} size="sm" className="h-9 gap-1.5 text-[13px]">
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
              Save schedule
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleProcessDue}
              disabled={processing}
              className="h-9 gap-1.5 border-border/80 bg-white text-[13px]"
            >
              {processing ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Play className="size-3.5" />
              )}
              Run due jobs
            </Button>
          </div>
        </SectionCard>

        {/* Compose card */}
        <SectionCard className="!p-0 overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border/60 bg-background/60 p-2">
            {(["ai", "manual"] as ComposeMode[]).map((m) => {
              const isActiveTab = composeMode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setComposeMode(m)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors",
                    isActiveTab
                      ? "bg-white text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m === "ai" ? (
                    <>
                      <Sparkles className="size-3.5" />
                      Generate with AI
                    </>
                  ) : (
                    <>
                      <PenSquare className="size-3.5" />
                      Write yourself
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-5">
            {composeMode === "ai" && (
              <div className="space-y-4">
                <div>
                  <p className="text-[12px] text-muted-foreground">
                    Generate a draft using the current topic and keywords from the schedule.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleGenerate(false)}
                    disabled={loading}
                    size="sm"
                    className="h-9 gap-1.5 text-[13px]"
                  >
                    {loading ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5" />
                    )}
                    Generate now
                  </Button>
                  <Button
                    onClick={() => handleGenerate(true)}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 border-border/80 bg-white text-[13px]"
                  >
                    <FileText className="size-3.5" />
                    Save as draft job
                  </Button>
                </div>

                {draft ? (
                  <div className="space-y-3 rounded-lg border border-border/60 bg-background/60 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-foreground">{draft.title}</p>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                          /{draft.slug}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadDraftIntoEditor(draft)}
                          className="h-7 gap-1 border-border/80 bg-white px-2 text-[11px]"
                        >
                          <PenSquare className="size-3" />
                          Edit in editor
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyDraft}
                          className="h-7 gap-1 border-border/80 bg-white px-2 text-[11px]"
                        >
                          <Copy className="size-3" />
                          {copied ? "Copied" : "Copy"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePublishAI("draft")}
                          disabled={publishing !== null}
                          className="h-7 border-border/80 bg-white px-2 text-[11px]"
                        >
                          {publishing === "draft" ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            "CMS draft"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePublishAI("publish")}
                          disabled={publishing !== null}
                          className="h-7 gap-1 px-2 text-[11px]"
                        >
                          {publishing === "publish" ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            <>
                              <Send className="size-3" />
                              Publish
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    {draft.meta_description && (
                      <p className="text-[11px] italic text-muted-foreground">
                        {draft.meta_description}
                      </p>
                    )}
                    <pre className="max-h-52 overflow-y-auto whitespace-pre-wrap rounded-md bg-background/80 p-3 text-[11px] leading-relaxed text-muted-foreground">
                      {draft.content_markdown}
                    </pre>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-lg border border-dashed border-border/60 bg-background/40 px-3 py-6 text-center">
                    <p className="text-[12px] text-muted-foreground">
                      No draft yet — generate one to preview and publish.
                    </p>
                  </div>
                )}
              </div>
            )}

            {composeMode === "manual" && (
              <div className="space-y-3">
                <div>
                  <FieldLabel>Title</FieldLabel>
                  <Input
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Your blog post title"
                    className="h-10 border-border/80 bg-white text-[14px] font-medium focus-visible:border-border focus-visible:ring-0"
                  />
                  {manualTitle.trim() && (
                    <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                      /{slugify(manualTitle)}
                    </p>
                  )}
                </div>

                <div>
                  <FieldLabel>Content</FieldLabel>
                  <RichEditor
                    value={manualHtml}
                    onChange={setManualHtml}
                    placeholder="Write your blog post here. Use the toolbar above for headings, lists, links and formatting…"
                    minHeight={320}
                  />
                </div>

                <div>
                  <FieldLabel>
                    Meta description{" "}
                    <span className="font-normal lowercase text-muted-foreground/70">
                      (optional, SEO)
                    </span>
                  </FieldLabel>
                  <Input
                    value={manualMeta}
                    onChange={(e) => setManualMeta(e.target.value)}
                    maxLength={160}
                    placeholder="Short summary under 160 characters"
                    className="h-9 border-border/80 bg-white text-[13px] focus-visible:border-border focus-visible:ring-0"
                  />
                  <p
                    className={cn(
                      "mt-1 text-[11px]",
                      manualMeta.length > 155 ? "text-amber-600" : "text-muted-foreground",
                    )}
                  >
                    {manualMeta.length} / 160
                  </p>
                </div>

                <div>
                  <FieldLabel>
                    Tags{" "}
                    <span className="font-normal lowercase text-muted-foreground/70">
                      (optional, comma-separated)
                    </span>
                  </FieldLabel>
                  <Input
                    value={manualTags}
                    onChange={(e) => setManualTags(e.target.value)}
                    placeholder="seo, ai, content marketing"
                    className="h-9 border-border/80 bg-white text-[13px] focus-visible:border-border focus-visible:ring-0"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handlePublishManual("publish")}
                    disabled={publishing !== null || !manualTitle.trim() || !manualHtml.trim()}
                    className="h-9 gap-1.5 text-[13px]"
                  >
                    {publishing === "publish" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    Publish now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublishManual("draft")}
                    disabled={publishing !== null || !manualTitle.trim() || !manualHtml.trim()}
                    className="h-9 gap-1.5 border-border/80 bg-white text-[13px]"
                  >
                    {publishing === "draft" ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <FileText className="size-3.5" />
                    )}
                    Save as CMS draft
                  </Button>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Calendar */}
      <SectionCard>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-muted-foreground" />
            <SectionLabel>Content calendar</SectionLabel>
            {totalJobs > 0 && (
              <span className="text-[11px] text-muted-foreground">· {totalJobs} jobs</span>
            )}
          </div>
          <div className="flex gap-0.5 rounded-md border border-border/60 bg-background/60 p-0.5">
            {(["week", "month"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setCalendarView(v)}
                className={cn(
                  "rounded-sm px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors",
                  calendarView === v
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {jobsByDate.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-background/40 px-3 py-10 text-center">
            <CalendarDays className="mb-2 size-6 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">No scheduled posts</p>
            <p className="mt-1 max-w-xs text-[12px] text-muted-foreground">
              Save a schedule above to queue daily blog jobs, or generate one-off drafts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {jobsByDate.map(([date, dayJobs]) => {
              const d = new Date(`${date}T00:00:00`);
              const pretty = d.toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              return (
                <div
                  key={date}
                  className="rounded-lg border border-border/60 bg-background/60 p-3"
                >
                  <p className="mb-2 text-[12px] font-semibold text-foreground">
                    {pretty}
                    <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                      {dayJobs.length} job{dayJobs.length === 1 ? "" : "s"}
                    </span>
                  </p>
                  <div className="space-y-1.5">
                    {dayJobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/50 bg-card/80 px-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium text-foreground">
                            {job.title || job.topic || "Scheduled blog"}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {new Date(job.scheduled_for).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <StatusPill status={job.status} />
                          {job.status === "needs_review" && (
                            <Button
                              size="sm"
                              onClick={() => handlePublishJob(job.id)}
                              disabled={publishingJobId === job.id}
                              className="h-7 gap-1 px-2 text-[11px]"
                            >
                              {publishingJobId === job.id ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <>
                                  <Send className="size-3" />
                                  Publish
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
