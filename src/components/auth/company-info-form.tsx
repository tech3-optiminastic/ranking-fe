"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { useSession } from "@/lib/auth-client";
import { createOrganization } from "@/lib/api/organizations";
import { getOrFetchOnboardingToken } from "@/lib/api/onboarding-security";
import { routes } from "@/lib/config";
import axios from "axios";

const companyInfoSchema = z.object({
  name: z.string().trim().min(1, "Company name is required."),
  // Website is optional but if provided, must be a valid URL.
  url: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https?:\/\/.+\..+/.test(v), {
      message: "Enter a valid URL (e.g. https://example.com).",
    }),
});

export function CompanyInfoForm() {
  const router = useRouter();
  const { email: storeEmail, setCompanyInfo, setStep } = useOnboardingStore();
  const { data: session } = useSession();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prefer session email (survives refresh), fall back to store email
  const email = session?.user?.email || storeEmail;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    const parsed = companyInfoSchema.safeParse({ name, url });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the form.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Single-use onboarding token gates /organizations/onboard/ — fetch
      // one even if the user can bypass server-side (internal email /
      // active sub); the extra round-trip is cheap and removes the only
      // branch where we'd otherwise hit a 401.
      let onboardingToken: string | undefined;
      try {
        onboardingToken = await getOrFetchOnboardingToken();
      } catch {
        // Best-effort — fall through and let the server's 401 surface.
      }

      await createOrganization(
        {
          name: parsed.data.name,
          url: parsed.data.url ?? "",
          email,
        },
        onboardingToken,
      );
      setCompanyInfo(parsed.data.name, parsed.data.url ?? "");
      setStep("complete");
      router.push(routes.dashboard);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        router.push(routes.dashboard);
        return;
      }
      setError("Failed to save company info. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return (
      <div className="space-y-2 text-center">
        <p className="text-[12px] text-destructive">Session expired. Please sign up again.</p>
        <Button
          variant="outline"
          className="h-9 rounded-md text-[13px]"
          onClick={() => router.push(routes.signUp)}
        >
          Back to sign up
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="company-name" className="text-[12px] font-medium">
          Company name
        </Label>
        <Input
          id="company-name"
          placeholder="Acme Inc."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="h-9 rounded-md border-neutral-200 bg-white text-[13px]"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="company-url" className="text-[12px] font-medium">
          Website <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="company-url"
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="h-9 rounded-md border-neutral-200 bg-white text-[13px]"
        />
      </div>
      {error && <p className="text-[12px] font-medium text-destructive">{error}</p>}
      <Button
        type="submit"
        className="auth-cta-btn h-9 w-full rounded-md text-[13px] font-medium text-white hover:text-white"
        disabled={loading}
      >
        {loading ? "Saving…" : "Continue"}
      </Button>
    </form>
  );
}
