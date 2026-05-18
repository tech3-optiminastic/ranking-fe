"use client";

import { useEffect } from "react";
import * as amplitude from "@amplitude/unified";
import { useConsentStore } from "@/lib/stores/consent-store";

let inited = false;

function initOnce() {
  if (inited) return;
  if (typeof window === "undefined") return;
  inited = true;
  amplitude.initAll("14542be394561e71412581eba013eddf", {
    analytics: {
      autocapture: {
        attribution: true,
        fileDownloads: true,
        formInteractions: true,
        pageViews: true,
        sessions: true,
        elementInteractions: true,
        networkTracking: true,
        webVitals: true,
        frustrationInteractions: {
          thrashedCursor: true,
          errorClicks: true,
          deadClicks: true,
          rageClicks: true,
        },
      },
    },
    sessionReplay: { sampleRate: 1 },
  });
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
