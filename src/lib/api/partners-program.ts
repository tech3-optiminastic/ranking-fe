import { z } from "zod";
import { apiClient } from "./client";

// ─── Schemas ────────────────────────────────────────────────────────────────

const socialEntrySchema = z.object({
  platform: z.string(),
  handle: z.string(),
});

const audienceSizeSchema = z.enum(["<1k", "1k-10k", "10k-100k", "100k-1m", "1m+", ""]);

const payoutMethodSchema = z.enum(["wise", "paypal", "bank", "crypto", "other"]);

const commissionBucketSchema = z.enum(["pending", "locked", "paid", "cancelled"]);

const commissionStatusSchema = z.enum(["pending", "paid", "cancelled"]);

const commissionRowSchema = z.object({
  created_at: z.string(),
  referee_email: z.string(),
  commission_amount: z.number(),
  currency: z.string(),
  status: commissionStatusSchema,
  bucket: commissionBucketSchema,
});

const creatorStatsBucketSchema = z.object({
  count: z.number(),
  amount: z.number(),
});

const creatorApplyResponseSchema = z.object({
  code: z.string(),
  name: z.string(),
  share_url: z.string(),
  dashboard_url: z.string(),
  status: z.string(),
  commission_percent: z.number(),
  created: z.boolean(),
});

const creatorStatsResponseSchema = z.object({
  code: z.string(),
  name: z.string(),
  country: z.string(),
  social_platforms: z.array(socialEntrySchema),
  status: z.string(),
  commission_percent: z.number(),
  created_at: z.string(),
  share_url: z.string(),
  dashboard_url: z.string(),
  stats: z.object({
    attributions_total: z.number(),
    attributions_active: z.number(),
    pending: creatorStatsBucketSchema,
    locked: creatorStatsBucketSchema,
    paid: creatorStatsBucketSchema,
    lock_window_days: z.number(),
  }),
  recent_commissions: z.array(commissionRowSchema),
});

const creatorExistsResponseSchema = z.object({
  exists: z.boolean(),
  code: z.string().optional(),
  status: z.string().optional(),
});

const creatorMeStatsSchema = z.object({
  attributions_total: z.number(),
  attributions_active: z.number(),
  pending: creatorStatsBucketSchema,
  locked: creatorStatsBucketSchema,
  paid: creatorStatsBucketSchema,
  lock_window_days: z.number(),
  recent_commissions: z.array(commissionRowSchema),
});

const creatorMeResponseSchema = z.object({
  email: z.string(),
  code: z.string(),
  name: z.string(),
  country: z.string(),
  social_platforms: z.array(socialEntrySchema),
  audience_size: audienceSizeSchema,
  payout_method: payoutMethodSchema,
  payout_details: z.string(),
  status: z.string(),
  commission_percent: z.number(),
  created_at: z.string(),
  share_url: z.string(),
  dashboard_url: z.string(),
  stats: creatorMeStatsSchema,
});

// Update response = the me response minus stats + created_at.
const creatorUpdateResponseSchema = creatorMeResponseSchema.omit({
  stats: true,
  created_at: true,
});

// ─── Types ──────────────────────────────────────────────────────────────────

export type SocialEntry = z.infer<typeof socialEntrySchema>;
export type AudienceSize = z.infer<typeof audienceSizeSchema>;
export type PayoutMethod = z.infer<typeof payoutMethodSchema>;
export type CommissionBucket = z.infer<typeof commissionBucketSchema>;
export type CommissionRow = z.infer<typeof commissionRowSchema>;
export type CreatorStatsBucket = z.infer<typeof creatorStatsBucketSchema>;
export type CreatorApplyResponse = z.infer<typeof creatorApplyResponseSchema>;
export type CreatorStatsResponse = z.infer<typeof creatorStatsResponseSchema>;
export type CreatorExistsResponse = z.infer<typeof creatorExistsResponseSchema>;
export type CreatorMeStats = z.infer<typeof creatorMeStatsSchema>;
export type CreatorMeResponse = z.infer<typeof creatorMeResponseSchema>;

export interface CreatorApplyPayload {
  name: string;
  email: string;
  country: string;
  social_platforms: SocialEntry[];
  audience_size?: AudienceSize;
  payout_method: PayoutMethod;
  payout_details: string;
}

export interface CreatorUpdatePayload {
  email: string;
  name?: string;
  country?: string;
  social_platforms?: SocialEntry[];
  audience_size?: AudienceSize;
  payout_method?: PayoutMethod;
  payout_details?: string;
}

// ─── API calls ──────────────────────────────────────────────────────────────

export async function applyToCreatorsProgram(
  payload: CreatorApplyPayload,
): Promise<CreatorApplyResponse> {
  const { data } = await apiClient.post("/api/partners/apply/", payload);
  return creatorApplyResponseSchema.parse(data);
}

export async function getCreatorStats(code: string): Promise<CreatorStatsResponse> {
  const { data } = await apiClient.get("/api/partners/stats/", { params: { code } });
  return creatorStatsResponseSchema.parse(data);
}

export async function checkCreatorExists(email: string): Promise<CreatorExistsResponse> {
  const { data } = await apiClient.get("/api/partners/exists/", { params: { email } });
  return creatorExistsResponseSchema.parse(data);
}

export async function getMyCreatorProfile(email: string): Promise<CreatorMeResponse> {
  const { data } = await apiClient.get("/api/partners/me/", { params: { email } });
  return creatorMeResponseSchema.parse(data);
}

export async function updateMyCreatorProfile(
  payload: CreatorUpdatePayload,
): Promise<Omit<CreatorMeResponse, "stats" | "created_at">> {
  const { data } = await apiClient.patch("/api/partners/me/", payload);
  return creatorUpdateResponseSchema.parse(data);
}
