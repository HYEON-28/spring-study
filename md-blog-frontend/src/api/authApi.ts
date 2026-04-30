const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export interface User {
  id: string;
  githubUsername: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  githubProfileUrl: string | null;
}

export async function getMe(token: string): Promise<User> {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function hasLinkedRepo(token: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/auth/has-linked-repo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Unauthorized");
  const data: { linked: boolean } = await res.json();
  return data.linked;
}
