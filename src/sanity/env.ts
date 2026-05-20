import { env } from "@/lib/env";

export const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION;

// Fall back to empty strings instead of throwing at import time. The Studio
// page surfaces the missing vars with a readable error page, and read-side
// Sanity calls return empty results rather than crashing the whole route.
export const dataset = env.NEXT_PUBLIC_SANITY_DATASET ?? "";

export const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

export const sanityConfigured = Boolean(dataset && projectId);

export const sanityConfigError =
  !dataset && !projectId
    ? "Missing NEXT_PUBLIC_SANITY_PROJECT_ID and NEXT_PUBLIC_SANITY_DATASET"
    : !dataset
      ? "Missing NEXT_PUBLIC_SANITY_DATASET"
      : !projectId
        ? "Missing NEXT_PUBLIC_SANITY_PROJECT_ID"
        : "";
