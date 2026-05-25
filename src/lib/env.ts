/**
 * Public env vars (NEXT_PUBLIC_*), runtime-validated via Zod.
 *
 * Why Zod here:
 *   - Catches typos (`NEXT_PUBLI_API_URL`) at module load instead of "why
 *     is the dashboard fetching from undefined?" deep in a useEffect.
 *   - Strips trailing slashes / coerces shapes consistently so callers
 *     don't each reinvent the cleanup.
 *   - Single source of truth — drops the `process.env.X || "fallback"`
 *     littering across the codebase.
 *
 * Note on Next.js inlining: `process.env.NEXT_PUBLIC_X` must be referenced
 * *statically* (no bracket access, no dynamic key) so the bundler can
 * substitute the literal value at build time. The schema below names each
 * key explicitly — don't refactor to a loop.
 */
import { z } from "zod";

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .default("http://localhost:8000")
    .transform(trimTrailingSlash),
  NEXT_PUBLIC_BETTER_AUTH_URL: z
    .string()
    .url("NEXT_PUBLIC_BETTER_AUTH_URL must be a valid URL")
    .default("http://localhost:3000")
    .transform(trimTrailingSlash),
  NEXT_PUBLIC_SITE_URL: z
    .string()
    .url("NEXT_PUBLIC_SITE_URL must be a valid URL")
    .default("https://signalor.ai")
    .transform(trimTrailingSlash),
  NEXT_PUBLIC_CLARITY_PROJECT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1).optional(),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().min(1).default("2026-05-02"),
  // The dev URL the Signalor plugin serves from. Users paste this into
  // Framer's "Open Development Plugin" dialog (Framer doesn't expose a
  // deep-link to open a dev plugin from an external URL). Override with
  // the marketplace listing once published.
  NEXT_PUBLIC_FRAMER_PLUGIN_URL: z
    .string()
    .url()
    .default("https://localhost:5176/")
    .transform(trimTrailingSlash),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_CLARITY_PROJECT_ID: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
  NEXT_PUBLIC_FRAMER_PLUGIN_URL: process.env.NEXT_PUBLIC_FRAMER_PLUGIN_URL,
});

if (!parsed.success) {
  // Make the failure loud — silent fallbacks let bad config reach prod.
  console.error("Invalid NEXT_PUBLIC_* environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid public environment variables — see console for details");
}

export const env = parsed.data;
export type PublicEnv = z.infer<typeof publicEnvSchema>;
