"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "@/components/icons";
import {
  listRawFiles,
  saveRawFile,
  type RawFile,
  type RawFileName,
} from "@/lib/api/content-optimisation";

type Props = {
  slug: string;
  pluginConnected: boolean;
};

/**
 * Raw crawler/AI files panel. Lists robots.txt + the three Shopify Page-served
 * files (llms-txt, humans-txt, ads-txt) for the connected store. Each row
 * shows its status; clicking expands to an editor where the merchant can
 * write/replace the file contents.
 *
 * Server-side mapping is in apps/integrations/services/shopify_raw_files.py.
 */
export function RawFilesPanel({ slug, pluginConnected }: Props) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<RawFileName | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savedFlash, setSavedFlash] = useState<RawFileName | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["raw-files", slug],
    enabled: !!slug && pluginConnected,
    queryFn: () => listRawFiles(slug),
    staleTime: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: ({ name, content }: { name: RawFileName; content: string }) =>
      saveRawFile(slug, name, content),
    onSuccess: (_, { name }) => {
      setSavedFlash(name);
      setTimeout(() => setSavedFlash((current) => (current === name ? null : current)), 2000);
      // Refetch the list so the row's `present` flag updates.
      queryClient.invalidateQueries({ queryKey: ["raw-files", slug] });
    },
  });

  if (!pluginConnected) {
    return (
      <div className="space-y-3 p-4 text-[12px] text-muted-foreground">
        <p className="font-medium text-foreground">Crawler & AI files</p>
        <p>Connect Shopify in Settings → Integrations to create or edit these files.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 text-[12px] text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        Loading crawler files…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 p-4 text-[12px] text-rose-600 dark:text-rose-400">
        <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
        <span>Couldn&apos;t load files. Check your Shopify connection.</span>
      </div>
    );
  }

  const files: RawFile[] = data ?? [];

  return (
    <div className="space-y-1 p-2">
      <div className="px-2 pb-2 pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Crawler & AI files
        </p>
      </div>

      {files.map((f) => {
        const isOpen = expanded === f.name;
        const draft = drafts[f.name] ?? (f.content || f.default_template || "");
        const isSaving = saveMutation.isPending && saveMutation.variables?.name === f.name;
        const justSaved = savedFlash === f.name;
        return (
          <div key={f.name} className="overflow-hidden rounded-md border border-border bg-card">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : f.name)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] hover:bg-muted/40"
            >
              {isOpen ? (
                <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              <span className="font-medium text-foreground">{f.label}</span>
              <span
                className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  f.present
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                    : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                }`}
              >
                {f.present ? (
                  <>
                    <CheckCircle2 className="size-3" /> Present
                  </>
                ) : (
                  <>Missing</>
                )}
              </span>
            </button>

            {isOpen ? (
              <div className="space-y-2 border-t border-border px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {f.url}
                    <ExternalLink className="size-3" />
                  </a>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {f.kind === "theme_asset" ? "theme asset" : "shopify page"}
                  </span>
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDrafts((d) => ({ ...d, [f.name]: e.target.value }))}
                  className="min-h-[180px] w-full resize-y rounded-md border border-border bg-background px-3 py-2 font-mono text-[11.5px] leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={f.default_template}
                  spellCheck={false}
                />
                {saveMutation.isError && saveMutation.variables?.name === f.name ? (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400">
                    {(saveMutation.error as Error)?.message || "Save failed."}
                  </p>
                ) : null}
                <div className="flex items-center justify-end gap-2">
                  {justSaved ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" /> Saved
                    </span>
                  ) : null}
                  <button
                    type="button"
                    disabled={isSaving || !draft.trim()}
                    onClick={() => saveMutation.mutate({ name: f.name, content: draft })}
                    className="auth-cta-btn inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-[11px] font-medium text-white hover:text-white disabled:opacity-40"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="size-3 animate-spin" />
                        Saving…
                      </>
                    ) : f.present ? (
                      "Save"
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
