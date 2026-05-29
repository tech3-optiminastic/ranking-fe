import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { CreatorDashboardShell } from "./_components/creator-dashboard-shell";

export const metadata: Metadata = buildMetadata({
  title: "Creator dashboard",
  description: "Manage your Signalor creator link, earnings, and payouts.",
  path: "/creator-dashboard",
  noindex: true,
});

export default function CreatorDashboardLayout({ children }: { children: React.ReactNode }) {
  return <CreatorDashboardShell>{children}</CreatorDashboardShell>;
}
