import { z } from "zod";
import { apiClient } from "./client";

const organizationSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  owner_email: z.string(),
  created_at: z.string(),
});

const checkResponseSchema = z.object({
  exists: z.boolean(),
});

const updatedListSchema = z.object({
  updated: z.array(z.string()),
});

export type Organization = z.infer<typeof organizationSchema>;

interface OnboardPayload {
  name: string;
  url: string;
  email: string;
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export async function createOrganization(
  payload: OnboardPayload,
  onboardingToken?: string,
): Promise<Organization> {
  const headers = onboardingToken ? { "X-Onboarding-Token": onboardingToken } : undefined;
  const { data } = await apiClient.post(
    "/api/organizations/onboard/",
    {
      ...payload,
      email: normalizeEmail(payload.email),
    },
    { headers },
  );
  return organizationSchema.parse(data);
}

export async function checkOrganizationExists(email: string): Promise<boolean> {
  const { data } = await apiClient.get("/api/organizations/check/", {
    params: { email: normalizeEmail(email) },
  });
  return checkResponseSchema.parse(data).exists;
}

export async function getOrganizations(email: string): Promise<Organization[]> {
  const { data } = await apiClient.get("/api/organizations/", {
    params: { email: normalizeEmail(email) },
  });
  return z.array(organizationSchema).parse(data);
}

export async function updateOrganization(
  id: number,
  payload: { name?: string; url?: string },
): Promise<Organization> {
  const { data } = await apiClient.patch(`/api/organizations/${id}/`, payload);
  return organizationSchema.parse(data);
}

export async function deleteOrganization(id: number): Promise<void> {
  await apiClient.delete(`/api/organizations/${id}/`);
}

// Exposed in case other modules want to validate the same shape.
export { updatedListSchema };
