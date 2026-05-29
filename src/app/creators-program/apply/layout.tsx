import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Apply to the Signalor Creators Program",
  description:
    "Get your Signalor creator link in 30 seconds. Auto-approved, 20% commission on every first paid subscription, monthly payouts.",
  path: "/creators-program/apply",
});

export default function CreatorsProgramApplyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        id="ld-creators-program-apply-breadcrumb"
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Creators Program", path: "/creators-program" },
          { name: "Apply", path: "/creators-program/apply" },
        ])}
      />
      {children}
    </>
  );
}
