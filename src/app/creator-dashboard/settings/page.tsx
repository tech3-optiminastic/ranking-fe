"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useCreator } from "../_components/creator-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  AUDIENCE_SIZES,
  CountrySelect,
  FieldLabel,
  PAYOUT_METHODS,
  SocialPlatformsField,
} from "@/components/creator/creator-form-fields";
import { updateMyCreatorProfile } from "@/lib/api/partners-program";
import type { AudienceSize, PayoutMethod, SocialEntry } from "@/lib/api/partners-program";
import { Check, Loader2, Save } from "@/components/icons";

const settingsSchema = z.object({
  name: z.string().trim().min(1, "Name can't be empty."),
  social_platforms: z
    .array(z.object({ platform: z.string(), handle: z.string().trim().min(1) }))
    .min(1, "Add at least one social platform with a handle."),
  payout_details: z.string().trim().min(3, "Add the details we need to pay you."),
});

export default function CreatorSettingsPage() {
  const { profile, loading, refresh } = useCreator();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [socials, setSocials] = useState<SocialEntry[]>([]);
  const [audience, setAudience] = useState<AudienceSize>("");
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("wise");
  const [payoutDetails, setPayoutDetails] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setName(profile.name);
    setCountry(profile.country);
    setSocials(profile.social_platforms);
    setAudience(profile.audience_size);
    setPayoutMethod(profile.payout_method);
    setPayoutDetails(profile.payout_details);
  }, [profile]);

  if (loading || !profile) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const activePayout = PAYOUT_METHODS.find((p) => p.value === payoutMethod) ?? PAYOUT_METHODS[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError(null);
    const parsed = settingsSchema.safeParse({
      name,
      social_platforms: socials
        .map((s) => ({ ...s, handle: s.handle.trim() }))
        .filter((s) => s.handle),
      payout_details: payoutDetails,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please review the form.");
      return;
    }

    setSaving(true);
    try {
      await updateMyCreatorProfile({
        email: profile.email,
        name: parsed.data.name,
        country,
        social_platforms: parsed.data.social_platforms,
        audience_size: audience || undefined,
        payout_method: payoutMethod,
        payout_details: parsed.data.payout_details,
      });
      await refresh();
      setSavedAt(Date.now());
      window.setTimeout(() => setSavedAt(null), 2500);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(detail || "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Profile & payout</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Update how you appear publicly and how we send your earnings. Email and code are fixed.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[13px] font-semibold text-foreground">Identity</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Shown on your public dashboard at /creators-program/{profile.code}.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel>Email (locked)</FieldLabel>
              <Input
                value={profile.email}
                disabled
                className="h-10 cursor-not-allowed border-border bg-muted/40 text-[13px]"
              />
            </div>
            <div>
              <FieldLabel>Creator code (locked)</FieldLabel>
              <Input
                value={profile.code}
                disabled
                className="h-10 cursor-not-allowed border-border bg-muted/40 font-mono text-[13px]"
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Full name</FieldLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Creator"
                className="h-10 border-border bg-background text-[13px]"
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel>Country</FieldLabel>
              <CountrySelect value={country} onChange={setCountry} />
            </div>
          </div>
        </div>

        {/* Channels card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[13px] font-semibold text-foreground">Channels</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Add the platforms where you'll share Signalor. Shown publicly.
          </p>
          <div className="mt-4">
            <SocialPlatformsField value={socials} onChange={setSocials} />
          </div>

          <div className="mt-5">
            <FieldLabel>Audience size (optional)</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {AUDIENCE_SIZES.map((b) => {
                const on = audience === b.value;
                return (
                  <button
                    key={b.value}
                    type="button"
                    onClick={() => setAudience(on ? "" : b.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                      on
                        ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700/60 dark:bg-orange-950/30 dark:text-orange-200"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/40",
                    )}
                  >
                    {b.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Payout card */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-[13px] font-semibold text-foreground">Payout</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Stored privately. Never shown on your public dashboard.
          </p>

          <div className="mt-4">
            <FieldLabel>Method</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {PAYOUT_METHODS.map((p) => {
                const on = payoutMethod === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPayoutMethod(p.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                      on
                        ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700/60 dark:bg-orange-950/30 dark:text-orange-200"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/40",
                    )}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">{activePayout.hint}</p>
          </div>

          <div className="mt-4">
            <FieldLabel>Payout details</FieldLabel>
            <textarea
              value={payoutDetails}
              onChange={(e) => setPayoutDetails(e.target.value)}
              placeholder={activePayout.placeholder}
              rows={payoutMethod === "bank" || payoutMethod === "other" ? 3 : 2}
              className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-[13px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-400/40"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-3 border-t border-border bg-background/80 py-4 backdrop-blur">
          {savedAt ? (
            <p className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="size-3.5" />
              Saved
            </p>
          ) : null}
          <Button
            type="submit"
            disabled={saving}
            className="h-10 gap-2 bg-foreground text-[13px] font-semibold text-background hover:opacity-90"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
