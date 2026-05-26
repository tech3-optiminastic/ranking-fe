import { z } from "zod";
import { apiClient } from "./client";

const environmentSchema = z.enum(["live", "test"]);

const apiKeySchema = z.object({
  id: z.number(),
  name: z.string(),
  environment: environmentSchema,
  key_prefix: z.string(),
  key_last4: z.string(),
  created_by_email: z.string(),
  created_at: z.string(),
  last_used_at: z.string().nullable(),
  revoked_at: z.string().nullable(),
});

// Plaintext is returned EXACTLY once (right after creation) and never persisted server-side.
const apiKeyWithSecretSchema = apiKeySchema.extend({
  key: z.string(),
});

export type ApiKey = z.infer<typeof apiKeySchema>;
export type ApiKeyWithSecret = z.infer<typeof apiKeyWithSecretSchema>;
export type ApiKeyEnvironment = z.infer<typeof environmentSchema>;

export async function listApiKeys(params: { email: string; orgId?: number }): Promise<ApiKey[]> {
  const { data } = await apiClient.get("/api/keys/", {
    params: { email: params.email, org_id: params.orgId },
  });
  return z.array(apiKeySchema).parse(data);
}

export async function createApiKey(input: {
  email: string;
  orgId?: number;
  name: string;
  environment: ApiKeyEnvironment;
}): Promise<ApiKeyWithSecret> {
  const { data } = await apiClient.post("/api/keys/", {
    email: input.email,
    org_id: input.orgId,
    name: input.name,
    environment: input.environment,
  });
  return apiKeyWithSecretSchema.parse(data);
}

export async function revokeApiKey(input: {
  id: number;
  email: string;
  orgId?: number;
}): Promise<ApiKey> {
  const { data } = await apiClient.delete(`/api/keys/${input.id}/`, {
    params: { email: input.email, org_id: input.orgId },
  });
  return apiKeySchema.parse(data);
}

// ─── Webhooks ───────────────────────────────────────────────────────────────

const webhookEventSchema = z.enum(["analysis.completed"]);

const webhookSchema = z.object({
  id: z.number(),
  url: z.string(),
  events: z.array(webhookEventSchema),
  secret_last4: z.string(),
  is_active: z.boolean(),
  created_by_email: z.string(),
  created_at: z.string(),
  last_delivered_at: z.string().nullable(),
});

const webhookWithSecretSchema = webhookSchema.extend({
  secret: z.string(),
});

export type WebhookEvent = z.infer<typeof webhookEventSchema>;
export type Webhook = z.infer<typeof webhookSchema>;
export type WebhookWithSecret = z.infer<typeof webhookWithSecretSchema>;

export async function listWebhooks(params: { email: string; orgId?: number }): Promise<Webhook[]> {
  const { data } = await apiClient.get("/api/webhooks/", {
    params: { email: params.email, org_id: params.orgId },
  });
  return z.array(webhookSchema).parse(data);
}

export async function createWebhook(input: {
  email: string;
  orgId?: number;
  url: string;
  events: WebhookEvent[];
}): Promise<WebhookWithSecret> {
  const { data } = await apiClient.post("/api/webhooks/", {
    email: input.email,
    org_id: input.orgId,
    url: input.url,
    events: input.events,
  });
  return webhookWithSecretSchema.parse(data);
}

export async function deleteWebhook(input: {
  id: number;
  email: string;
  orgId?: number;
}): Promise<void> {
  await apiClient.delete(`/api/webhooks/${input.id}/`, {
    params: { email: input.email, org_id: input.orgId },
  });
}

// ─── Next.js deployments ────────────────────────────────────────────────────

const nextJsEnvironmentSchema = z.enum(["production", "preview", "development"]);
const nextJsStatusSchema = z.enum(["pending", "analyzing", "complete", "failed"]);

const nextJsDeploymentSchema = z.object({
  id: z.number(),
  commit_sha: z.string(),
  environment: nextJsEnvironmentSchema,
  url: z.string(),
  host: z.string(),
  status: nextJsStatusSchema,
  error_message: z.string(),
  build_metadata: z.record(z.string(), z.unknown()),
  analysis_slug: z.string().nullable(),
  analysis_status: z.string().nullable(),
  analysis_score: z.number().nullable(),
  created_at: z.string(),
  deployed_at: z.string().nullable(),
});

export type NextJsDeployment = z.infer<typeof nextJsDeploymentSchema>;

export async function listNextJsDeployments(params: {
  email: string;
  orgId?: number;
  limit?: number;
}): Promise<NextJsDeployment[]> {
  const { data } = await apiClient.get("/api/integrations/nextjs/deployments/", {
    params: { email: params.email, org_id: params.orgId, limit: params.limit },
  });
  return z.array(nextJsDeploymentSchema).parse(data);
}
