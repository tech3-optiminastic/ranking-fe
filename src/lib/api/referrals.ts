import { z } from "zod";
import { apiClient } from "./client";

const referralStatusSchema = z.enum(["pending", "paid", "cancelled"]);

const referralEntrySchema = z.object({
  referee_email: z.string(),
  status: referralStatusSchema,
  created_at: z.string(),
  paid_at: z.string().nullable(),
});

const referralStatsSchema = z.object({
  total: z.number(),
  pending: z.number(),
  paid: z.number(),
  cancelled: z.number(),
  rewards_applied: z.number(),
  pending_reward: z
    .object({
      percent_off: z.number(),
      created_at: z.string(),
    })
    .nullable(),
});

const referralMeResponseSchema = z.object({
  email: z.string(),
  code: z.string(),
  share_url: z.string(),
  referrals: z.array(referralEntrySchema),
  stats: referralStatsSchema,
});

const referralRedeemResponseSchema = z.object({
  referrer_email: z.string(),
  referee_email: z.string(),
  status: referralStatusSchema,
  discount_percent: z.number(),
});

export type ReferralStatus = z.infer<typeof referralStatusSchema>;
export type ReferralEntry = z.infer<typeof referralEntrySchema>;
export type ReferralStats = z.infer<typeof referralStatsSchema>;
export type ReferralMeResponse = z.infer<typeof referralMeResponseSchema>;
export type ReferralRedeemResponse = z.infer<typeof referralRedeemResponseSchema>;

export async function getReferralMe(email: string): Promise<ReferralMeResponse> {
  const { data } = await apiClient.get("/api/referrals/me/", { params: { email } });
  return referralMeResponseSchema.parse(data);
}

export async function redeemReferralCode(
  code: string,
  email: string,
): Promise<ReferralRedeemResponse> {
  const { data } = await apiClient.post("/api/referrals/redeem/", { code, email });
  return referralRedeemResponseSchema.parse(data);
}
