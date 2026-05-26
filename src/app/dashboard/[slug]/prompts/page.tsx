"use client";

import { useParams } from "next/navigation";
import { useRun } from "../_components/run-context";
import { CompetitorPromptsTable } from "@/components/analyzer/competitor-prompts-table";
import { CompetitorsSkeleton } from "@/components/dashboard/skeletons";

export default function PromptAnalysisPage() {
  const { slug } = useParams<{ slug: string }>();
  const { run, loading, error } = useRun();

  if (loading) return <CompetitorsSkeleton />;

  if (error) {
    return <div className="px-2 py-6 text-sm text-destructive sm:px-0">{error}</div>;
  }

  const competitors = run?.competitors ?? [];

  return (
    <div className="px-2 py-2 sm:px-0">
      <CompetitorPromptsTable
        slug={slug}
        competitors={competitors}
        yourUrl={run?.url}
        yourName={run?.display_brand_name || run?.brand_name || undefined}
      />
    </div>
  );
}
