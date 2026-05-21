"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AlertCircle, ExternalLink, FileText, X } from "@/components/icons";
import { BrowserChrome } from "@/components/optimisation/browser-chrome";
import { PageIframe } from "@/components/optimisation/page-iframe";
import { ElementEditor } from "@/components/optimisation/element-editor";
import { RawFilesPanel } from "@/components/optimisation/raw-files-panel";
import { useRun } from "../../_components/run-context";
import {
  applyElementEdit,
  getContentPageFields,
  getContentPages,
  rewriteElement,
  type ContentPage,
  type ContentPageFields,
  type PreviewElement,
} from "@/lib/api/content-optimisation";

export default function ContentOptimisationPage() {
  const { slug } = useParams<{ slug: string }>();
  const { run } = useRun();

  const [url, setUrl] = useState("");
  const [pageFields, setPageFields] = useState<ContentPageFields | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cursor-style element-level edit. The right rail only mounts while an
  // element is selected; otherwise the preview fills the full width.
  const [selectedElement, setSelectedElement] = useState<PreviewElement | null>(null);
  const [rewritingElement, setRewritingElement] = useState(false);
  const [applyingElement, setApplyingElement] = useState(false);

  // Raw crawler/AI files panel toggle (robots.txt, llms-txt, etc.). The
  // toggle replaces the element editor when active — there's only one
  // right rail and these two are mutually exclusive editing surfaces.
  const [showRawFiles, setShowRawFiles] = useState(false);

  // browser-style history for back/forward
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const navigatingFromHistory = useRef(false);

  // Cached across tab switches via QueryClient (5min staleTime, 30min gcTime).
  const { data: pages = [] as ContentPage[] } = useQuery({
    queryKey: ["content-pages", slug],
    enabled: !!slug,
    queryFn: () => getContentPages(slug).catch(() => [] as ContentPage[]),
  });

  // Lock the domain from the run's base URL so users can only edit the path.
  const baseUrl = useMemo(() => {
    const raw = run?.url ?? "";
    if (!raw) return "";
    try {
      return new URL(raw.includes("://") ? raw : `https://${raw}`).origin;
    } catch {
      return "";
    }
  }, [run?.url]);

  // Set URL immediately from run?.url without waiting for pages to load.
  // Normalize to include protocol so getPath() can strip the domain correctly.
  const didInitUrl = useRef(false);
  useEffect(() => {
    if (didInitUrl.current || !run?.url) return;
    didInitUrl.current = true;
    const raw = run.url.trim();
    setUrl(raw.includes("://") ? raw : `https://${raw}`);
  }, [run?.url]);

  // Seed the URL once pages arrive (fallback if run?.url arrives late).
  useEffect(() => {
    if (url) return;
    const initial = pages[0]?.url || run?.url || "";
    if (initial) setUrl(initial);
  }, [pages, run?.url, url]);

  const loadPage = useCallback(
    async (target: string) => {
      if (!slug || !target) return;
      setPageLoading(true);
      setPageError(null);
      setError(null);
      setNotice(null);
      setSelectedElement(null);
      try {
        const data = await getContentPageFields(slug, target);
        setPageFields(data);
        if (!data.preview_image) {
          setPageError(
            "Visual preview unavailable — run `playwright install chromium` on the server to enable screenshots.",
          );
        }
      } catch (err: unknown) {
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail;
        setPageError(detail || "Couldn't load this page.");
        setPageFields(null);
      } finally {
        setPageLoading(false);
      }
    },
    [slug],
  );

  async function handleRewriteElement(instruction: string): Promise<string> {
    if (!selectedElement) return "";
    setRewritingElement(true);
    setError(null);
    try {
      return await rewriteElement(slug, selectedElement.tag, selectedElement.text, instruction);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || "Couldn't rewrite this element.");
      return "";
    } finally {
      setRewritingElement(false);
    }
  }

  async function handleApplyElement(newText: string) {
    if (!selectedElement || !url) return;
    setApplyingElement(true);
    setError(null);
    setNotice(null);
    try {
      const result = await applyElementEdit(slug, url, selectedElement.text, newText);
      const ok = (result.saved?.length || 0) > 0 && (result.failed?.length || 0) === 0;
      if (ok) {
        // Clear selection immediately — the old text the user clicked is
        // gone now; leaving it around makes the next Apply send stale
        // original_text and get a 400 back.
        setSelectedElement(null);
        setNotice("Applied to live site. Refreshing preview…");

        // Poll for fresh content. Shopify's storefront CDN can take 5–15s
        // to invalidate after a theme-asset / body_html change, so we
        // retry up to ~20s until the new text appears, then stop.
        //
        // Detection covers both edit paths:
        //   - body_html edits: new text appears in pageFields.body_html
        //   - theme-asset edits: new text appears in preview_elements (the
        //     fresh Playwright screenshot's clickable text list)
        const maxAttempts = 8;
        const delayMs = 2500;
        let refreshed = false;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          await new Promise((r) => setTimeout(r, delayMs));
          try {
            const fresh = await getContentPageFields(slug, url);
            const inBody = (fresh.body_html || "").includes(newText);
            const inElements = (fresh.preview_elements || []).some((el) =>
              (el.text || "").includes(newText),
            );
            if (inBody || inElements) {
              setPageFields(fresh);
              setNotice("Preview refreshed.");
              refreshed = true;
              break;
            }
            // Still stale — keep the latest screenshot regardless so the
            // user gets visual progress, but keep polling.
            setPageFields(fresh);
            setNotice(`Refreshing preview… (attempt ${attempt}/${maxAttempts})`);
          } catch {
            // Network blip — keep trying.
          }
        }
        if (!refreshed) {
          setNotice(
            "Edit applied. Shopify's CDN is still serving cached content — click the refresh button in a moment to see the change.",
          );
        }
      } else {
        const msg = result.failed?.[0]?.message || "Plugin returned an error.";
        setError(`Couldn't apply edit: ${msg}`);
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (status === 503) {
        setError(detail || "Connect WordPress or Shopify to apply this change.");
      } else {
        setError(detail || "Couldn't apply this edit.");
      }
    } finally {
      setApplyingElement(false);
    }
  }

  useEffect(() => {
    if (!url) return;
    loadPage(url);
    if (!navigatingFromHistory.current) {
      setHistory((h) => {
        const next = h.slice(0, historyIdx + 1);
        next.push(url);
        return next;
      });
      setHistoryIdx((idx) => idx + 1);
    }
    navigatingFromHistory.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  function handleBack() {
    if (historyIdx <= 0) return;
    navigatingFromHistory.current = true;
    setHistoryIdx(historyIdx - 1);
    setUrl(history[historyIdx - 1]);
  }

  function handleForward() {
    if (historyIdx >= history.length - 1) return;
    navigatingFromHistory.current = true;
    setHistoryIdx(historyIdx + 1);
    setUrl(history[historyIdx + 1]);
  }

  function handleRefresh() {
    if (url) loadPage(url);
  }

  const pluginConnected = !!pageFields?.plugin_connected;
  const applyDisabledHint = pluginConnected
    ? undefined
    : "Connect WordPress or Shopify in Settings → Integrations to apply changes.";

  return (
    <div className="flex h-[calc(100vh-72px)] min-h-0 flex-col">
      <div className="flex items-stretch" data-tour-card="content-chrome">
        <div className="flex-1 min-w-0">
          <BrowserChrome
            url={url}
            baseUrl={baseUrl}
            pages={pages}
            canGoBack={historyIdx > 0}
            canGoForward={historyIdx >= 0 && historyIdx < history.length - 1}
            isLoading={pageLoading}
            onUrlChange={(next) => setUrl(next)}
            onBack={handleBack}
            onForward={handleForward}
            onRefresh={handleRefresh}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setShowRawFiles((v) => !v);
            if (!showRawFiles) setSelectedElement(null);
          }}
          className={`mr-2 my-1 inline-flex items-center gap-1.5 rounded-md px-2.5 text-[11.5px] font-medium border transition ${
            showRawFiles
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-background text-foreground hover:bg-muted/40"
          }`}
          title="Crawler & AI files (robots.txt, llms-txt, humans-txt, ads-txt)"
        >
          <FileText className="size-3.5" />
          Crawler files
        </button>
      </div>

      {(error || notice || (!pluginConnected && pageFields)) && (
        <div className="flex flex-col gap-1 border-b border-border bg-muted/15 px-3 py-2">
          {!pluginConnected && pageFields ? (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <AlertCircle className="size-3.5" />
              <span>
                No plugin connected. Click any element to edit, but applying needs WordPress or
                Shopify.
              </span>
              <Link
                href={`/dashboard/${slug}/settings/integrations`}
                className="inline-flex items-center gap-0.5 font-semibold text-primary hover:underline"
              >
                Connect <ExternalLink className="size-3" />
              </Link>
            </div>
          ) : null}
          {error ? <p className="text-[11px] text-rose-600 dark:text-rose-400">{error}</p> : null}
          {notice ? (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{notice}</p>
          ) : null}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div
          className={`flex-1 min-w-0 ${selectedElement || showRawFiles ? "border-r border-border" : ""}`}
          data-tour-card="content-iframe"
        >
          <PageIframe
            previewImage={pageFields?.preview_image || ""}
            previewElements={pageFields?.preview_elements || []}
            viewportWidth={pageFields?.preview_viewport_width || 1440}
            isLoading={pageLoading}
            emptyMessage={pageError || undefined}
            onRetry={url ? () => loadPage(url) : undefined}
            selectedElementId={selectedElement?.id ?? null}
            onSelectElement={setSelectedElement}
          />
        </div>

        {showRawFiles ? (
          <div className="w-[380px] min-w-[320px] shrink-0 overflow-y-auto bg-background">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
              <p className="text-[12px] font-semibold text-foreground">Crawler & AI files</p>
              <button
                type="button"
                onClick={() => setShowRawFiles(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                aria-label="Close"
              >
                <X className="size-3.5" />
              </button>
            </div>
            <RawFilesPanel slug={slug} pluginConnected={pluginConnected} />
          </div>
        ) : selectedElement ? (
          <div className="w-[360px] min-w-[300px] shrink-0">
            <ElementEditor
              element={selectedElement}
              applyDisabled={!pluginConnected}
              applyDisabledHint={applyDisabledHint}
              isRewriting={rewritingElement}
              isApplying={applyingElement}
              onClose={() => setSelectedElement(null)}
              onRewrite={handleRewriteElement}
              onApply={handleApplyElement}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
