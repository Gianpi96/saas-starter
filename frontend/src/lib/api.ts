import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface UpdateProfilePayload {
  full_name?: string;
  email?: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/login", { email, password });
  return data;
}

export async function registerRequest(
  email: string,
  password: string,
  full_name?: string
): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/api/auth/register", {
    email,
    password,
    full_name,
  });
  return data;
}

export async function logoutRequest(token: string): Promise<void> {
  await api.post("/api/auth/logout", {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function fetchMe(token: string): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/api/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function updateProfile(
  token: string,
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  const { data } = await api.patch<UserProfile>("/api/users/me", payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
}

export async function changePassword(
  token: string,
  current_password: string,
  new_password: string
): Promise<{ message: string }> {
  const { data } = await api.post<{ message: string }>(
    "/api/users/me/change-password",
    { current_password, new_password },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
}
