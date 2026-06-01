"use client";

import { useEffect } from "react";
import * as amplitude from "@amplitude/unified";
import { Types } from "@amplitude/unified";
import { useConsentStore } from "@/lib/stores/consent-store";

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY ?? "";

let inited = false;

function initOnce() {
  if (inited) return;
  if (typeof window === "undefined") return;
  if (!AMPLITUDE_API_KEY) {
    console.warn("[amplitude] NEXT_PUBLIC_AMPLITUDE_API_KEY missing — tracking disabled");
    return;
  }
  inited = true;
  amplitude.initAll(AMPLITUDE_API_KEY, {
    analytics: {
      autocapture: true,
      logLevel: Types.LogLevel.None,
    },
    sessionReplay: { sampleRate: 1 },
  });
}

export type UserTraits = Partial<{
  email: string;
  first_name: string;
  domain: string;
  geo_score: number;
  fix_count: number;
  top_competitor: string;
  competitor_list: string;
  cms_platform: "shopify" | "wordpress" | "other";
  top_recommendation_title: string;
  issue_count: number;
  competitor_count: number;
}>;

export function identifyUser(userId: string, traits: UserTraits): void {
  if (typeof window === "undefined" || !userId) return;
  amplitude.setUserId(userId);
  const id = new amplitude.Identify();
  for (const [k, v] of Object.entries(traits)) {
    if (v !== undefined && v !== null && v !== "") id.set(k, v as never);
  }
  amplitude.identify(id);
}

export function track(eventName: string, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  amplitude.track(eventName, props);
}

/**
 * Amplitude init component. Only initializes the SDK once the user has
 * granted analytics consent via the cookie banner. Renders nothing.
 */
export const Amplitude = () => {
  const analytics = useConsentStore((s) => s.analytics);
  const hydrated = useConsentStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && analytics) initOnce();
  }, [hydrated, analytics]);

  return null;
};

export default amplitude;
