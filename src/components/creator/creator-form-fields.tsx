"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { COUNTRIES, flagEmoji } from "@/lib/countries";
import { Check, ChevronDown, Search } from "@/components/icons";
import type { AudienceSize, SocialEntry } from "@/lib/api/partners-program";

export interface PlatformDef {
  key: string;
  label: string;
  placeholder: string;
}

export const PLATFORMS: PlatformDef[] = [
  { key: "youtube", label: "YouTube", placeholder: "@channel" },
  { key: "x", label: "X (Twitter)", placeholder: "@handle" },
  { key: "instagram", label: "Instagram", placeholder: "@handle" },
  { key: "tiktok", label: "TikTok", placeholder: "@handle" },
  { key: "linkedin", label: "LinkedIn", placeholder: "in/handle" },
  { key: "substack", label: "Substack", placeholder: "newsletter url" },
  { key: "podcast", label: "Podcast", placeholder: "show name" },
  { key: "blog", label: "Blog", placeholder: "blog url" },
];

export const AUDIENCE_SIZES: { value: AudienceSize; label: string }[] = [
  { value: "<1k", label: "Under 1k" },
  { value: "1k-10k", label: "1k – 10k" },
  { value: "10k-100k", label: "10k – 100k" },
  { value: "100k-1m", label: "100k – 1M" },
  { value: "1m+", label: "1M+" },
];

export interface PayoutMethodDef {
  value: "wise" | "paypal" | "bank" | "crypto" | "other";
  label: string;
  hint: string;
  placeholder: string;
}

export const PAYOUT_METHODS: PayoutMethodDef[] = [
  {
    value: "wise",
    label: "Wise",
    hint: "Cheapest international transfer for most creators.",
    placeholder: "Wise email or @wisetag",
  },
  {
    value: "paypal",
    label: "PayPal",
    hint: "Quick if you already use PayPal.",
    placeholder: "PayPal email",
  },
  {
    value: "bank",
    label: "Bank transfer",
    hint: "Direct deposit to your local bank account.",
    placeholder: "Account holder name, account number, IFSC/SWIFT, bank name",
  },
  {
    value: "crypto",
    label: "Crypto wallet",
    hint: "USDC or USDT on Polygon, Base, or Ethereum.",
    placeholder: "Network (e.g. USDC on Polygon) + wallet address",
  },
  {
    value: "other",
    label: "Other",
    hint: "We'll work it out — payoneer, UPI, anything reasonable.",
    placeholder: "Tell us how you'd like to be paid",
  },
];

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[12px] font-semibold text-foreground">{children}</label>
  );
}

export function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = useMemo(() => COUNTRIES.find((c) => c.code === value), [value]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-3 text-left text-[13px]",
          "focus:outline-none focus:ring-2 focus:ring-orange-400/40",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected ? (
            <>
              <span className="text-base leading-none">{flagEmoji(selected.code)}</span>
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            <span className="text-muted-foreground">Select country</span>
          )}
        </span>
        <ChevronDown
          className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                placeholder="Search country…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded border border-border bg-background py-1.5 pl-7 pr-2 text-[12px] focus:outline-none"
              />
            </div>
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-[12px] text-muted-foreground">No matches.</li>
            ) : (
              filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c.code);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-muted",
                      c.code === value &&
                        "bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-200",
                    )}
                  >
                    <span className="text-base leading-none">{flagEmoji(c.code)}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{c.code}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export function SocialPlatformsField({
  value,
  onChange,
}: {
  value: SocialEntry[];
  onChange: (next: SocialEntry[]) => void;
}) {
  const handleFor = (platform: string) => value.find((e) => e.platform === platform)?.handle ?? "";

  const togglePlatform = (platform: string) => {
    const exists = value.some((e) => e.platform === platform);
    if (exists) {
      onChange(value.filter((e) => e.platform !== platform));
    } else {
      onChange([...value, { platform, handle: "" }]);
    }
  };

  const updateHandle = (platform: string, handle: string) => {
    onChange(value.map((e) => (e.platform === platform ? { ...e, handle } : e)));
  };

  const enabled = new Set(value.map((e) => e.platform));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {PLATFORMS.map((p) => {
          const on = enabled.has(p.key);
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => togglePlatform(p.key)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12px] font-medium transition-colors",
                on
                  ? "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700/60 dark:bg-orange-950/30 dark:text-orange-200"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/40",
              )}
            >
              {on && <Check className="mr-1 inline size-3" />}
              {p.label}
            </button>
          );
        })}
      </div>
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((entry) => {
            const def = PLATFORMS.find((p) => p.key === entry.platform);
            return (
              <div key={entry.platform} className="flex items-center gap-2">
                <span className="w-24 shrink-0 text-[12px] font-medium text-foreground">
                  {def?.label ?? entry.platform}
                </span>
                <Input
                  value={handleFor(entry.platform)}
                  onChange={(e) => updateHandle(entry.platform, e.target.value)}
                  placeholder={def?.placeholder ?? "@handle"}
                  className="h-9 border-border bg-background text-[13px]"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
