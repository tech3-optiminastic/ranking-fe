"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { checkOrganizationExists } from "@/lib/api/organizations";
import { routes } from "@/lib/config";

const CALLBACK_TIMEOUT_MS = 10_000;

function CallbackResolver() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [timedOut, setTimedOut] = useState(false);

  // Timeout: if session never arrives, redirect to sign-in
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), CALLBACK_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  const callbackEmail = session?.user?.email;
  useEffect(() => {
    if (timedOut && !callbackEmail) {
      router.replace(routes.signIn);
    }
  }, [timedOut, callbackEmail, router]);

  // Resolve once per email — better-auth re-renders churn `session` and
  // would otherwise re-fire checkOrganizationExists (and signOut) on every
  // render before the redirect completes.
  const resolvedRef = useRef(false);
  useEffect(() => {
    if (isPending || !callbackEmail) return;
    if (resolvedRef.current) return;
    resolvedRef.current = true;

    const mode = searchParams.get("mode") || "sign-in";

    async function resolve() {
      const hasOrg = await checkOrganizationExists(callbackEmail!).catch(() => false);

      if (mode === "sign-up") {
        router.replace(hasOrg ? routes.dashboard : routes.onboardingCompanyInfo);
      } else {
        if (hasOrg) {
          router.replace(routes.dashboard);
        } else {
          await signOut();
          router.replace(`${routes.signUp}?error=no-account`);
        }
      }
    }

    resolve();
  }, [callbackEmail, isPending, router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent">
      {/* <p className="text-muted-foreground">Setting up your account...</p> */}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <CallbackResolver />
    </Suspense>
  );
}
