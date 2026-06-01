import { apiClient } from "./client";

export interface PricingViewedPayload {
  email: string;
  amplitude_user_id?: string;
  first_name?: string;
  domain?: string;
  geo_score?: number;
  fix_count?: number;
  top_competitor?: string;
  competitor_list?: string;
  cms_platform?: string;
  top_recommendation_title?: string;
  issue_count?: number;
  competitor_count?: number;
}

/**
 * Enrol the user in the pricing-dropoff drip (or refresh their merge-tag data
 * if already enrolled). Idempotent. Failures are silently swallowed by the
 * caller — analytics pings should never break the UX.
 */
export async function pingPricingViewed(payload: PricingViewedPayload): Promise<void> {
  await apiClient.post("/drip/pricing-viewed/", payload);
}

/**
 * Permanently exclude the user from the drip. Called when the FE fires
 * `checkout_started` to Amplitude.
 */
export async function pingCheckoutStarted(email: string): Promise<void> {
  await apiClient.post("/drip/checkout-started/", { email });
}
