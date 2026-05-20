import { z } from "zod";
import { apiClient, apiClientLong } from "./client";

// ─── Schemas ────────────────────────────────────────────────────────────────

const contentFieldSchema = z.enum(["title", "meta_description", "body_html", "schema_jsonld"]);

const contentPageSchema = z.object({
  url: z.string(),
  path: z.string(),
  title: z.string(),
  last_audited_at: z.string().nullable(),
});

const contentSuggestionSchema = z.object({
  id: z.number(),
  title: z.string(),
  rationale: z.string(),
  target_field: contentFieldSchema,
  current_excerpt: z.string(),
  proposed_value: z.string(),
  status: z.enum(["proposed", "used", "dismissed"]),
  created_at: z.string().nullable(),
});

const previewElementBBoxSchema = z.object({
  x: z.number(),
  y: z.number(),
  w: z.number(),
  h: z.number(),
});

const previewElementSchema = z.object({
  id: z.number(),
  tag: z.string(),
  text: z.string(),
  bbox: previewElementBBoxSchema,
});

const contentPageFieldsSchema = z.object({
  url: z.string(),
  title: z.string(),
  meta_description: z.string(),
  body_html: z.string(),
  schema_jsonld: z.string(),
  preview_image: z.string(),
  preview_elements: z.array(previewElementSchema),
  preview_viewport_width: z.number(),
  source: z.enum(["plugin", "public", "empty"]),
  plugin_connected: z.boolean(),
  plugin_provider: z.string(),
  suggestions: z.array(contentSuggestionSchema),
});

const contentSaveResultSchema = z.object({
  saved: z.array(contentFieldSchema),
  failed: z.array(z.object({ field: contentFieldSchema, message: z.string() })),
  plugin_responses: z.record(z.string(), z.unknown()),
});

const applyElementResultSchema = contentSaveResultSchema.extend({
  noop: z.boolean().optional(),
});

const pagesResponseSchema = z.object({ pages: z.array(contentPageSchema).optional() });
const suggestionsResponseSchema = z.object({
  suggestions: z.array(contentSuggestionSchema).optional(),
});
const newTextResponseSchema = z.object({ new_text: z.string().optional() });

// ─── Types ──────────────────────────────────────────────────────────────────

export type ContentField = z.infer<typeof contentFieldSchema>;
export type ContentPage = z.infer<typeof contentPageSchema>;
export type ContentSuggestion = z.infer<typeof contentSuggestionSchema>;
export type PreviewElementBBox = z.infer<typeof previewElementBBoxSchema>;
export type PreviewElement = z.infer<typeof previewElementSchema>;
export type ContentPageFields = z.infer<typeof contentPageFieldsSchema>;
export type ContentSaveResult = z.infer<typeof contentSaveResultSchema>;

// ─── API calls ──────────────────────────────────────────────────────────────

export async function getContentPages(slug: string): Promise<ContentPage[]> {
  const { data } = await apiClient.get(`/api/analyzer/runs/s/${slug}/content/pages/`);
  return pagesResponseSchema.parse(data).pages ?? [];
}

export async function getContentPageFields(slug: string, url: string): Promise<ContentPageFields> {
  // Long timeout because the BE renders the URL in headless Chromium to
  // produce the preview screenshot, typically 4–10s per page.
  const { data } = await apiClientLong.get(`/api/analyzer/runs/s/${slug}/content/page/`, {
    params: { url },
    timeout: 45_000,
  });
  return contentPageFieldsSchema.parse(data);
}

export async function getContentSuggestions(
  slug: string,
  url: string,
): Promise<ContentSuggestion[]> {
  const { data } = await apiClientLong.post(
    `/api/analyzer/runs/s/${slug}/content/suggestions/`,
    { url },
    { timeout: 90_000 },
  );
  return suggestionsResponseSchema.parse(data).suggestions ?? [];
}

export async function dismissContentSuggestion(slug: string, suggestionId: number): Promise<void> {
  await apiClient.post(`/api/analyzer/runs/s/${slug}/content/suggestions/${suggestionId}/dismiss/`);
}

export async function saveContentPageEdits(
  slug: string,
  url: string,
  fields: Partial<Record<ContentField, string>>,
  usedSuggestionIds: number[] = [],
): Promise<ContentSaveResult> {
  const { data } = await apiClientLong.post(
    `/api/analyzer/runs/s/${slug}/content/save/`,
    { url, fields, used_suggestion_ids: usedSuggestionIds },
    { timeout: 45_000 },
  );
  return contentSaveResultSchema.parse(data);
}

export async function rewriteElement(
  slug: string,
  tag: string,
  text: string,
  instruction = "",
): Promise<string> {
  const { data } = await apiClientLong.post(
    `/api/analyzer/runs/s/${slug}/content/rewrite-element/`,
    { tag, text, instruction },
    { timeout: 60_000 },
  );
  return newTextResponseSchema.parse(data).new_text ?? "";
}

export async function applyElementEdit(
  slug: string,
  url: string,
  originalText: string,
  newText: string,
): Promise<ContentSaveResult & { noop?: boolean }> {
  const { data } = await apiClientLong.post(
    `/api/analyzer/runs/s/${slug}/content/apply-element/`,
    { url, original_text: originalText, new_text: newText },
    { timeout: 45_000 },
  );
  return applyElementResultSchema.parse(data);
}
