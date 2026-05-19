"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { getOrganizations } from "@/lib/api/organizations";
import { getRunList } from "@/lib/api/analyzer";
import { routes } from "@/lib/config";
import { SignalorLoader } from "@/components/ui/signalor-loader";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <SignalorLoader size="lg" />
        </div>
      }
    >
      <DashboardRedirect />
    </Suspense>
  );
}

/**
 * This page is just a router:
 * - No session → /sign-in
 * - No org → /onboarding/company-info
 * - Has org + runs → /dashboard/[slug]
 * - Has org, no runs → /onboarding/company-info
 * Pricing is gated only when the user clicks Launch on onboarding (not here).
 */
function DashboardRedirect() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    const email = session?.user?.email;
    if (isPending) return;
    if (!session || !email) {
      router.replace(routes.signIn);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const orgs = await getOrganizations(email);
        if (cancelled) return;
        if (orgs.length === 0) {
          router.replace(routes.onboardingCompanyInfo);
          return;
        }

        // Search ALL orgs for a usable run, not just orgs[0]. Otherwise a
        // paid user whose first org has no runs (but other orgs do) bounces
        // to onboarding, which bounces them back to /dashboard, forever.
        for (const org of orgs) {
          const runs = await getRunList(email, org.id).catch(() => []);
          if (cancelled) return;
          if (runs.length === 0) continue;
          const bestRun =
            runs.find((r) => r.status === "complete") ??
            runs.find((r) => r.status !== "failed") ??
            runs[0];
          router.replace(routes.dashboardProject(bestRun.slug));
          return;
        }

        // Orgs exist but no runs anywhere → onboarding.
        router.replace(routes.onboardingCompanyInfo);
      } catch {
        if (!cancelled) router.replace(routes.onboardingCompanyInfo);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isPending, session?.user?.email, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignalorLoader size="lg" label="Loading..." />
    </div>
  );
}
