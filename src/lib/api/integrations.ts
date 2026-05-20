import { z } from "zod";
import { apiClient } from "./client";

// ─── Shared schemas ─────────────────────────────────────────────────────────

const syncStatusSchema = z.enum(["pending", "syncing", "complete", "failed"]);

const integrationInfoSchema = z.object({
  id: z.number(),
  provider: z.enum(["google_analytics", "shopify", "wordpress"]),
  provider_display: z.string(),
  is_active: z.boolean(),
  metadata: z.record(z.string(), z.unknown()),
  created_at: z.string(),
  updated_at: z.string(),
});

const messageOnlySchema = z.object({ message: z.string() });

const integrationActionSchema = z.object({
  message: z.string(),
  integration: integrationInfoSchema,
});

const authUrlSchema = z.object({ auth_url: z.string() });

// ─── GA4 ────────────────────────────────────────────────────────────────────

const ga4PropertySchema = z.object({
  property_id: z.string(),
  display_name: z.string(),
  account_name: z.string(),
});

const gaPropertiesResponseSchema = z.object({ properties: z.array(ga4PropertySchema) });

const gaPageMatchSchema = z.object({
  found: z.boolean(),
  host_match: z.boolean(),
  analyzed_host: z.string(),
  matched_host: z.string(),
  page_path: z.string(),
  sessions: z.number(),
  bounce_rate: z.number(),
  avg_session_duration: z.number(),
});

const gaDataSnapshotSchema = z.object({
  id: z.number(),
  date_start: z.string(),
  date_end: z.string(),
  sessions: z.number(),
  organic_sessions: z.number(),
  bounce_rate: z.number(),
  avg_session_duration: z.number(),
  top_pages: z.array(
    z.object({
      path: z.string(),
      sessions: z.number(),
      bounce_rate: z.number(),
      avg_duration: z.number(),
    }),
  ),
  traffic_sources: z.array(
    z.object({
      source: z.string(),
      medium: z.string(),
      sessions: z.number(),
    }),
  ),
  daily_trend: z.array(
    z.object({
      date: z.string(),
      sessions: z.number(),
      organic_sessions: z.number(),
    }),
  ),
  countries: z.array(
    z.object({
      country: z.string(),
      country_id: z.string(),
      sessions: z.number(),
    }),
  ),
  sync_status: syncStatusSchema,
  error_message: z.string(),
  created_at: z.string(),
  page_match: gaPageMatchSchema.optional(),
});

// ─── Shopify ────────────────────────────────────────────────────────────────

const shopifyDataSnapshotSchema = z.object({
  id: z.number(),
  date_start: z.string(),
  date_end: z.string(),
  total_orders: z.number(),
  total_revenue: z.string(),
  average_order_value: z.string(),
  total_customers: z.number(),
  top_products: z.array(
    z.object({
      title: z.string(),
      quantity_sold: z.number(),
      revenue: z.string(),
      product_id: z.string(),
    }),
  ),
  daily_orders: z.array(
    z.object({
      date: z.string(),
      orders: z.number(),
      revenue: z.string(),
    }),
  ),
  sync_status: syncStatusSchema,
  error_message: z.string(),
  created_at: z.string(),
});

// ─── WordPress ──────────────────────────────────────────────────────────────

const wordPressDataSnapshotSchema = z.object({
  id: z.number(),
  date_start: z.string(),
  date_end: z.string(),
  total_posts: z.number(),
  total_pages: z.number(),
  published_posts_30d: z.number(),
  updated_posts_30d: z.number(),
  top_posts: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      slug: z.string(),
      url: z.string(),
      published_at: z.string(),
      modified_at: z.string(),
    }),
  ),
  daily_publishing: z.array(
    z.object({
      date: z.string(),
      published_posts: z.number(),
    }),
  ),
  sync_status: syncStatusSchema,
  error_message: z.string(),
  created_at: z.string(),
});

const wordPressConnectResponseSchema = z.object({
  oauth_url: z.string().optional(),
  status: z.string().optional(),
  site_name: z.string().optional(),
  message: z.string().optional(),
});

// ─── Blog Agent ─────────────────────────────────────────────────────────────

const blogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  url: z.string(),
  published_at: z.string(),
  modified_at: z.string(),
});

const blogPostsResponseSchema = z.object({
  connected: z.boolean(),
  site_name: z.string().optional(),
  site_url: z.string().optional(),
  total_posts: z.number().optional(),
  published_posts_30d: z.number().optional(),
  posts: z.array(blogPostSchema),
  error: z.string().optional(),
});

const blogDraftSchema = z.object({
  title: z.string(),
  slug: z.string(),
  meta_description: z.string(),
  tags: z.array(z.string()),
  content_html: z.string(),
});

const blogPublishResultSchema = z.object({
  post_id: z.number(),
  post_url: z.string(),
  status: z.string(),
  edit_url: z.string(),
});

const shopifyBlogPostSchema = z.object({
  id: z.number(),
  title: z.string(),
  handle: z.string(),
  url: z.string(),
  published_at: z.string(),
  author: z.string(),
});

const shopifyBlogPostsResponseSchema = z.object({
  connected: z.boolean(),
  shop_name: z.string().optional(),
  shop_url: z.string().optional(),
  total_posts: z.number().optional(),
  published_posts_30d: z.number().optional(),
  posts: z.array(shopifyBlogPostSchema),
  error: z.string().optional(),
});

// ─── Correlation ────────────────────────────────────────────────────────────

const correlationResponseSchema = z.object({
  data_points: z.array(
    z.object({
      date: z.string(),
      geo_score: z.number(),
      sessions: z.number().nullable(),
      organic_sessions: z.number().nullable(),
      url: z.string(),
    }),
  ),
  has_ga_data: z.boolean(),
});

// ─── Types (re-exported) ────────────────────────────────────────────────────

export type IntegrationInfo = z.infer<typeof integrationInfoSchema>;
export type GA4Property = z.infer<typeof ga4PropertySchema>;
export type GADataSnapshot = z.infer<typeof gaDataSnapshotSchema>;
export type ShopifyDataSnapshot = z.infer<typeof shopifyDataSnapshotSchema>;
export type WordPressDataSnapshot = z.infer<typeof wordPressDataSnapshotSchema>;
export type BlogPost = z.infer<typeof blogPostSchema>;
export type BlogPostsResponse = z.infer<typeof blogPostsResponseSchema>;
export type BlogDraft = z.infer<typeof blogDraftSchema>;
export type BlogPublishResult = z.infer<typeof blogPublishResultSchema>;
export type ShopifyBlogPost = z.infer<typeof shopifyBlogPostSchema>;
export type ShopifyBlogPostsResponse = z.infer<typeof shopifyBlogPostsResponseSchema>;
export type CorrelationDataPoint = z.infer<typeof correlationResponseSchema>["data_points"][number];
export type CorrelationResponse = z.infer<typeof correlationResponseSchema>;

// ─── GA4 API ────────────────────────────────────────────────────────────────

export async function getGAAuthUrl(email: string): Promise<{ auth_url: string }> {
  const { data } = await apiClient.get("/api/integrations/google-analytics/auth-url/", {
    params: { email },
  });
  return authUrlSchema.parse(data);
}

export async function sendGACallback(
  code: string,
  state: string,
): Promise<{ message: string; integration: IntegrationInfo }> {
  const { data } = await apiClient.post("/api/integrations/google-analytics/callback/", {
    code,
    state,
  });
  return integrationActionSchema.parse(data);
}

export async function disconnectGA(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.delete("/api/integrations/google-analytics/disconnect/", {
    params: { email },
  });
  return messageOnlySchema.parse(data);
}

export async function getIntegrationStatus(
  email: string,
  orgId?: number,
): Promise<IntegrationInfo[]> {
  const { data } = await apiClient.get("/api/integrations/status/", {
    params: { email, org_id: orgId },
  });
  return z.array(integrationInfoSchema).parse(data);
}

export async function getGAProperties(email: string): Promise<{ properties: GA4Property[] }> {
  const { data } = await apiClient.get("/api/integrations/google-analytics/properties/", {
    params: { email },
  });
  return gaPropertiesResponseSchema.parse(data);
}

export async function selectGAProperty(
  email: string,
  propertyId: string,
  propertyName: string,
): Promise<{ message: string; integration: IntegrationInfo }> {
  const { data } = await apiClient.post("/api/integrations/google-analytics/select-property/", {
    email,
    property_id: propertyId,
    property_name: propertyName,
  });
  return integrationActionSchema.parse(data);
}

export async function syncGAData(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post("/api/integrations/google-analytics/sync/", null, {
    params: { email },
  });
  return messageOnlySchema.parse(data);
}

export async function getGAData(email: string, analyzedUrl?: string): Promise<GADataSnapshot> {
  const { data } = await apiClient.get("/api/integrations/google-analytics/data/", {
    params: { email, analyzed_url: analyzedUrl },
  });
  return gaDataSnapshotSchema.parse(data);
}

// ─── Shopify API ────────────────────────────────────────────────────────────

export async function connectShopify(
  email: string,
  shopDomain: string,
  accessToken: string,
): Promise<{ message: string; integration: IntegrationInfo }> {
  const { data } = await apiClient.post("/api/integrations/shopify/connect/", {
    email,
    shop_domain: shopDomain,
    access_token: accessToken,
  });
  return integrationActionSchema.parse(data);
}

export async function getShopifyAuthUrl(
  email: string,
  shopDomain: string,
  returnTo?: string,
  orgId?: number,
  storefrontPassword?: string,
): Promise<{ auth_url: string }> {
  const { data } = await apiClient.get("/api/integrations/shopify/auth-url/", {
    params: {
      email,
      shop: shopDomain,
      return_to: returnTo,
      org_id: orgId,
      storefront_password: storefrontPassword || undefined,
      // Must match the tab the user started from (localhost vs 127.0.0.1, prod domain).
      ...(typeof window !== "undefined" ? { frontend_base: window.location.origin } : {}),
    },
  });
  return authUrlSchema.parse(data);
}

export async function disconnectShopify(
  email: string,
  orgId?: number,
): Promise<{ message: string }> {
  const { data } = await apiClient.delete("/api/integrations/shopify/disconnect/", {
    params: { email, org_id: orgId },
  });
  return messageOnlySchema.parse(data);
}

export async function syncShopifyData(email: string, orgId?: number): Promise<{ message: string }> {
  const { data } = await apiClient.post("/api/integrations/shopify/sync/", null, {
    params: { email, org_id: orgId },
  });
  return messageOnlySchema.parse(data);
}

export async function getShopifyData(email: string, orgId?: number): Promise<ShopifyDataSnapshot> {
  const { data } = await apiClient.get("/api/integrations/shopify/data/", {
    params: { email, org_id: orgId },
  });
  return shopifyDataSnapshotSchema.parse(data);
}

// ─── WordPress API ──────────────────────────────────────────────────────────

export async function connectWordPress(
  email: string,
  siteUrl: string,
  apiKey: string,
  returnTo?: string,
  username?: string,
): Promise<{ oauth_url?: string; status?: string; site_name?: string; message?: string }> {
  const { data } = await apiClient.post("/api/integrations/wordpress/connect/", {
    email,
    site_url: siteUrl,
    api_key: apiKey || undefined,
    username: username || undefined,
    return_to: returnTo || "/dashboard",
    frontend_base: window.location.origin,
  });
  return wordPressConnectResponseSchema.parse(data);
}

export async function disconnectWordPress(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.delete("/api/integrations/wordpress/disconnect/", {
    params: { email },
  });
  return messageOnlySchema.parse(data);
}

export async function syncWordPressData(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post("/api/integrations/wordpress/sync/", null, {
    params: { email },
  });
  return messageOnlySchema.parse(data);
}

export async function getWordPressData(email: string): Promise<WordPressDataSnapshot> {
  const { data } = await apiClient.get("/api/integrations/wordpress/data/", { params: { email } });
  return wordPressDataSnapshotSchema.parse(data);
}

// ─── Blog Agent ─────────────────────────────────────────────────────────────

export async function getBlogPosts(runSlug: string): Promise<BlogPostsResponse> {
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${runSlug}/blog/posts/`);
  return blogPostsResponseSchema.parse(data);
}

export async function generateBlogDraft(
  runSlug: string,
  topic: string,
  tone: string,
  wordCount: number,
): Promise<BlogDraft> {
  const { data } = await apiClient.post(`/api/analyzer/runs/s/${runSlug}/blog/generate/`, {
    topic,
    tone,
    word_count: wordCount,
  });
  return blogDraftSchema.parse(data);
}

export async function publishBlogDraft(
  runSlug: string,
  draft: BlogDraft & { status: "draft" | "publish" },
): Promise<BlogPublishResult> {
  const { data } = await apiClient.post(`/api/analyzer/runs/s/${runSlug}/blog/publish/`, draft);
  return blogPublishResultSchema.parse(data);
}

export async function deleteBlogPost(runSlug: string, postId: number): Promise<void> {
  await apiClient.delete(`/api/analyzer/runs/s/${runSlug}/blog/posts/${postId}/`);
}

// ─── Shopify Blog ───────────────────────────────────────────────────────────

export async function getShopifyBlogPosts(runSlug: string): Promise<ShopifyBlogPostsResponse> {
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${runSlug}/shopify-blog/posts/`);
  return shopifyBlogPostsResponseSchema.parse(data);
}

export async function publishShopifyBlogDraft(
  runSlug: string,
  draft: BlogDraft & { status: "draft" | "publish" },
): Promise<BlogPublishResult> {
  const { data } = await apiClient.post(
    `/api/analyzer/runs/s/${runSlug}/shopify-blog/publish/`,
    draft,
  );
  return blogPublishResultSchema.parse(data);
}

export async function deleteShopifyBlogPost(runSlug: string, postId: number): Promise<void> {
  await apiClient.delete(`/api/analyzer/runs/s/${runSlug}/shopify-blog/posts/${postId}/`);
}

// ─── Correlation ────────────────────────────────────────────────────────────

export async function getScoreTrafficCorrelation(email: string): Promise<CorrelationResponse> {
  const { data } = await apiClient.get("/api/integrations/score-traffic-correlation/", {
    params: { email },
  });
  return correlationResponseSchema.parse(data);
}
