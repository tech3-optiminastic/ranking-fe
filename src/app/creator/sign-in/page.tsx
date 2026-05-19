import { Suspense } from "react";
import { LandingMarketingShell } from "@/components/landing/landing-marketing-shell";
import { LandingFooter } from "@/components/landing/landing-footer";
import { CreatorAuthCard } from "@/components/creator/creator-auth-card";

export const metadata = {
  title: "Sign in — Signalor Creators",
  description: "Sign in to your Signalor creators-program account.",
  robots: { index: false, follow: false },
};

export default function CreatorSignInPage() {
  return (
    <LandingMarketingShell>
      <section className="px-6 py-16 sm:py-20 lg:px-12">
        <Suspense
          fallback={
            <div className="mx-auto w-full max-w-md rounded-2xl border border-black/8 bg-white p-8" />
          }
        >
          <CreatorAuthCard mode="sign-in" />
        </Suspense>
      </section>
      <LandingFooter />
    </LandingMarketingShell>
  );
}
