import { z } from "zod";
import { apiClient } from "./client";

const profileDataSchema = z.object({
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string(),
  /** Pre-signed B2 URL when the user has uploaded a photo, else null. */
  photo_url: z.string().nullable(),
});

const updatedFieldsSchema = z.object({
  updated: z.array(z.string()),
});

const photoUrlSchema = z.object({
  photo_url: z.string().nullable(),
});

export type ProfileData = z.infer<typeof profileDataSchema>;

export async function getProfile(email: string): Promise<ProfileData> {
  const { data } = await apiClient.get("/api/account/profile/", { params: { email } });
  return profileDataSchema.parse(data);
}

export async function updateProfile(
  email: string,
  fields: { first_name?: string; last_name?: string; phone_number?: string },
): Promise<{ updated: string[] }> {
  const { data } = await apiClient.patch("/api/account/profile/", { email, ...fields });
  return updatedFieldsSchema.parse(data);
}

export async function uploadProfilePhoto(
  email: string,
  file: File,
): Promise<{ photo_url: string | null }> {
  const form = new FormData();
  form.append("email", email);
  form.append("photo", file);
  // Bypass apiClient's default Content-Type=application/json — axios needs to
  // generate the multipart boundary itself when given a FormData body.
  const { data } = await apiClient.post("/api/account/profile/photo/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return photoUrlSchema.parse(data);
}

export async function deleteProfilePhoto(email: string): Promise<{ photo_url: string | null }> {
  const { data } = await apiClient.delete("/api/account/profile/photo/", { data: { email } });
  return photoUrlSchema.parse(data);
}
