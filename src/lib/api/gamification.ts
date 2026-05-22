import { z } from "zod";
import { apiClient } from "./client";

// ─── Schemas ────────────────────────────────────────────────────────────────

const achievementSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  points: z.number(),
});

const userGamificationSchema = z.object({
  user_email: z.string(),
  total_points: z.number(),
  points_this_week: z.number(),
  points_this_month: z.number(),
  level: z.number(),
  level_name: z.string(),
  current_level_points: z.number(),
  points_to_next_level: z.number(),
  level_progress: z.number(),
  current_streak: z.number(),
  longest_streak: z.number(),
  total_actions_completed: z.number(),
  total_actions_verified: z.number(),
  total_score_improvement: z.number(),
  achievements: z.array(z.string()),
  achievements_detail: z.array(achievementSchema),
  created_at: z.string(),
  updated_at: z.string(),
});

const actionStatusSchema = z.enum(["pending", "in_progress", "completed", "verified"]);

const userActionSchema = z.object({
  id: z.number(),
  action_type: z.string(),
  title: z.string(),
  description: z.string(),
  action: z.string(),
  points_value: z.number(),
  status: actionStatusSchema,
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  verified_at: z.string().nullable(),
  score_before: z.number().nullable(),
  score_after: z.number().nullable(),
  score_improvement: z.number().nullable(),
  notes: z.string(),
  created_at: z.string(),
  analysis_run: z.number().nullable(),
  recommendation: z.number().nullable(),
});

const actionTemplateSchema = z.object({
  action_type: z.string(),
  title: z.string(),
  description: z.string(),
  points: z.number(),
  category: z.string(),
});

const actionStatsSchema = z.object({
  total_actions: z.number(),
  pending_actions: z.number(),
  in_progress_actions: z.number(),
  completed_actions: z.number(),
  verified_actions: z.number(),
  total_points: z.number(),
  points_this_week: z.number(),
  current_streak: z.number(),
  level: z.number(),
  level_name: z.string(),
  level_progress: z.number(),
  recent_achievements: z.array(achievementSchema),
});

const updateActionResponseSchema = z.object({
  action: userActionSchema,
  gamification: userGamificationSchema,
  new_achievements: z.array(z.string()),
});

// ─── Types ──────────────────────────────────────────────────────────────────

export type Achievement = z.infer<typeof achievementSchema>;
export type UserGamification = z.infer<typeof userGamificationSchema>;
export type UserAction = z.infer<typeof userActionSchema>;
export type ActionTemplate = z.infer<typeof actionTemplateSchema>;
export type ActionStats = z.infer<typeof actionStatsSchema>;

export interface CreateActionPayload {
  action_type: string;
  title: string;
  description?: string;
  notes?: string;
  recommendation_id?: number;
  analysis_run_id?: number;
  score_before?: number;
}

export interface UpdateActionPayload {
  status?: "pending" | "in_progress" | "completed" | "verified";
  notes?: string;
  score_after?: number;
}

// ─── API calls ──────────────────────────────────────────────────────────────

export async function getUserGamification(email: string): Promise<UserGamification> {
  const { data } = await apiClient.get("/api/analyzer/gamification/", { params: { email } });
  return userGamificationSchema.parse(data);
}

export async function getActionStats(email: string, runId?: number): Promise<ActionStats> {
  const { data } = await apiClient.get("/api/analyzer/gamification/stats/", {
    params: { email, run_id: runId },
  });
  return actionStatsSchema.parse(data);
}

export async function getAchievements(): Promise<Achievement[]> {
  const { data } = await apiClient.get("/api/analyzer/achievements/");
  return z.array(achievementSchema).parse(data);
}

export async function getActionTemplates(): Promise<ActionTemplate[]> {
  const { data } = await apiClient.get("/api/analyzer/action-templates/");
  return z.array(actionTemplateSchema).parse(data);
}

export async function getUserActions(email: string, status?: string): Promise<UserAction[]> {
  const { data } = await apiClient.get("/api/analyzer/actions/", { params: { email, status } });
  return z.array(userActionSchema).parse(data);
}

export async function createUserAction(
  email: string,
  payload: CreateActionPayload,
): Promise<UserAction> {
  const { data } = await apiClient.post("/api/analyzer/actions/create/", { ...payload, email });
  return userActionSchema.parse(data);
}

export async function updateUserAction(
  actionId: number,
  payload: UpdateActionPayload,
): Promise<{ action: UserAction; gamification: UserGamification; new_achievements: string[] }> {
  const { data } = await apiClient.post(`/api/analyzer/actions/${actionId}/`, payload);
  return updateActionResponseSchema.parse(data);
}

export async function createQuickAction(
  email: string,
  recommendationId: number,
): Promise<UserAction> {
  const { data } = await apiClient.post("/api/analyzer/actions/quick/", {
    email,
    recommendation_id: recommendationId,
  });
  return userActionSchema.parse(data);
}

export async function bulkCreateActions(
  email: string,
  recommendations: Array<{
    id: number;
    title: string;
    description: string;
    action: string;
    priority: string;
    url?: string;
    analysis_run_id?: number;
  }>,
): Promise<UserAction[]> {
  const { data } = await apiClient.post("/api/analyzer/actions/bulk-create/", {
    email,
    recommendations,
  });
  return z.array(userActionSchema).parse(data);
}

// ─── Display helpers ────────────────────────────────────────────────────────

export function getStatusColor(status: string): string {
  switch (status) {
    case "pending":
      return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    case "in_progress":
      return "bg-teal-500/10 text-teal-500 border-teal-500/20";
    case "completed":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    case "verified":
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "verified":
      return "Verified";
    default:
      return status;
  }
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "pending":
      return "bg-gray-500/20 text-gray-500";
    case "in_progress":
      return "bg-teal-500/20 text-teal-500";
    case "completed":
      return "bg-green-500/20 text-green-500";
    case "verified":
      return "bg-yellow-500/20 text-yellow-500";
    default:
      return "bg-gray-500/20 text-gray-500";
  }
}

export function getLevelBadgeColor(level: number): string {
  if (level >= 7) return "bg-cyan-500 text-white";
  if (level >= 5) return "bg-yellow-500 text-black";
  if (level >= 3) return "bg-green-500 text-white";
  if (level >= 2) return "bg-teal-500 text-white";
  return "bg-gray-500 text-white";
}
