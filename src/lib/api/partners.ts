import { z } from "zod";
import { apiClient } from "./client";

const partnerAttributeResponseSchema = z.object({
  partner_code: z.string(),
  expires_at: z.string(),
});

const partnerTrackResponseSchema = z.object({
  valid: z.boolean(),
  partner_name: z.string().optional(),
});

export type PartnerAttributeResponse = z.infer<typeof partnerAttributeResponseSchema>;
export type PartnerTrackResponse = z.infer<typeof partnerTrackResponseSchema>;

export async function attributePartner(
  code: string,
  email: string,
  landingPath?: string,
): Promise<PartnerAttributeResponse> {
  const { data } = await apiClient.post("/api/partners/attribute/", {
    code,
    email,
    landing_path: landingPath ?? "",
  });
  return partnerAttributeResponseSchema.parse(data);
}

export async function trackPartnerClick(code: string): Promise<PartnerTrackResponse> {
  const { data } = await apiClient.post("/api/partners/track/", { code });
  return partnerTrackResponseSchema.parse(data);
}
