import { apiClient } from "./client";

export interface ProfileData {
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  /** Pre-signed B2 URL when the user has uploaded a photo, else null. */
  photo_url: string | null;
}

export async function getProfile(email: string): Promise<ProfileData> {
  const { data } = await apiClient.get<ProfileData>("/api/account/profile/", {
    params: { email },
  });
  return data;
}

export async function updateProfile(
  email: string,
  fields: { first_name?: string; last_name?: string; phone_number?: string },
): Promise<{ updated: string[] }> {
  const { data } = await apiClient.patch<{ updated: string[] }>("/api/account/profile/", {
    email,
    ...fields,
  });
  return data;
}

export async function uploadProfilePhoto(
  email: string,
  file: File,
): Promise<{ photo_url: string | null }> {
  const form = new FormData();
  form.append("email", email);
  form.append("photo", file);
  // Bypass apiClient's default Content-Type=application/json — axios needs to
  // generate the multipart boundary itself when given a FormData body. The
  // simplest reliable way is to send the request without the JSON default.
  const { data } = await apiClient.post<{ photo_url: string | null }>(
    "/api/account/profile/photo/",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data;
}

export async function deleteProfilePhoto(email: string): Promise<{ photo_url: string | null }> {
  const { data } = await apiClient.delete<{ photo_url: string | null }>(
    "/api/account/profile/photo/",
    {
      data: { email },
    },
  );
  return data;
}
