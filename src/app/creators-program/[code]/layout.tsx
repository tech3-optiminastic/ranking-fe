import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Signalor — Creator invite",
  description: "Open this invite link to unlock 10% off Signalor with a creator referral.",
  path: "/creators-program",
  noindex: true,
});

export default function CreatorsProgramInviteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
