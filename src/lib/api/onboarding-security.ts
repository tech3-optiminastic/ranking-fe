/**
 * Client for the analyzer onboarding gate.
 *
 * Flow: fetch a fresh token before each gated call, pass it via the
 * `X-Onboarding-Token` header. Tokens are **single-use** server-side
 * (issue #16 / sec/onboarding-replay): the server marks each token
 * consumed after a successful verify, so caching across calls breaks.
 *
 * Tokens have a 15-minute server-side TTL — that's the maximum lifetime
 * before signature expiry, not a reuse window. On 401 ("consumed" or
 * "expired") from a gated endpoint, fetch a fresh token and retry once.
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
 * Always returns a freshly-minted token — tokens are single-use server-side,
 * so caching would yield 401 ("consumed") on the second call.
 *
 * Name kept for backwards compatibility with existing call sites; the
 * "or fetch" is now redundant but harmless.
 */
export async function getOrFetchOnboardingToken(turnstileToken?: string): Promise<string> {
  const fresh = await fetchOnboardingToken(turnstileToken);
  return fresh.token;
}

/** No-op — kept for callers that still import it. Token caching was removed. */
export function clearOnboardingToken() {}
