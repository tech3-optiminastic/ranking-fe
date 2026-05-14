"use client";

import { useSession } from "@/lib/auth-client";
import { useRun } from "../_components/run-context";
import { BlogAutomationPanel } from "@/components/analyzer/blog-automation-panel";
import { Loader2 } from "@/components/icons";

export default function BlogAgentPage() {
  const { data: session } = useSession();
  const { run, loading: runLoading } = useRun();
  const email = session?.user?.email ?? "";

  if (runLoading || !run) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="px-2 py-2 sm:px-0">
      <BlogAutomationPanel email={email} runId={run.id} analyzedUrl={run.url ?? ""} />
    </div>
  );
}
