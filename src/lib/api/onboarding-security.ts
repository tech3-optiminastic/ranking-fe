/**
 * Client for the analyzer onboarding gate.
 *
 * Flow: fetchOnboardingToken() → store token in memory → pass via the
 * `X-Onboarding-Token` header on calls to /api/analyzer/generate-prompts/
 * (and any future public AI endpoint we gate this way).
 *
 * Tokens are ~15 min — usually one fetch per onboarding session is enough.
 * On 401 from a gated endpoint, refetch and retry once.
 */
import { z } from "zod";

import { config } from "@/lib/config";

const responseSchema = z.object({
  token: z.string().min(1),
  expires_in: z.number().int().positive(),
  turnstile_enabled: z.boolean(),
});

export type OnboardingToken = z.infer<typeof responseSchema>;

export async function fetchOnboardingToken(turnstileToken?: string): Promise<OnboardingToken> {
  const res = await fetch(`${config.apiBaseUrl}/api/analyzer/onboarding-start/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ turnstile_token: turnstileToken ?? "" }),
  });
  if (!res.ok) {
    const reason = await res.text().catch(() => "");
    throw new Error(`onboarding-start failed (${res.status}): ${reason || res.statusText}`);
  }
  return responseSchema.parse(await res.json());
}

/**
 * Module-scoped cache so repeated callers in a single page session reuse
 * the same token. Cleared on refresh — fine for the onboarding flow.
 */
let cached: { token: string; expiresAt: number } | null = null;

export async function getOrFetchOnboardingToken(turnstileToken?: string): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAt > now + 30_000) {
    return cached.token;
  }
  const fresh = await fetchOnboardingToken(turnstileToken);
  cached = { token: fresh.token, expiresAt: now + fresh.expires_in * 1000 };
  return fresh.token;
}

export function clearOnboardingToken() {
  cached = null;
}
