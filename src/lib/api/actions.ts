import { z } from "zod";
import { apiClient } from "./client";

const crawlFileStatusSchema = z.enum(["missing", "needs_improvement", "good"]);

const crawlEssentialFileSchema = z.object({
  key: z.enum(["llms", "robots", "sitemap"]),
  label: z.string(),
  url: z.string(),
  found: z.boolean(),
  status: crawlFileStatusSchema,
  http_status: z.number().nullable(),
  score: z.number(),
  issues: z.array(z.string()),
  recommendations: z.array(z.string()),
  excerpt: z.string(),
});

const crawlEssentialsResponseSchema = z.object({
  submenu_key: z.string(),
  submenu_name: z.string(),
  site_url: z.string(),
  source: z.enum(["wordpress", "shopify", "analyzer_run", "analyzed_url", "unknown"]),
  overall_score: z.number(),
  files: z.array(crawlEssentialFileSchema),
});

export type CrawlFileStatus = z.infer<typeof crawlFileStatusSchema>;
export type CrawlEssentialFile = z.infer<typeof crawlEssentialFileSchema>;
export type CrawlEssentialsResponse = z.infer<typeof crawlEssentialsResponseSchema>;

export async function getCrawlEssentialsStatus(
  email: string,
  runId?: number,
  analyzedUrl?: string,
): Promise<CrawlEssentialsResponse> {
  const { data } = await apiClient.get("/api/analyzer/actions/crawl-essentials/", {
    params: { email, run_id: runId, analyzed_url: analyzedUrl },
  });
  return crawlEssentialsResponseSchema.parse(data);
}
