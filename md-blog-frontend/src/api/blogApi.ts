const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export interface BlogRepo {
  githubRepoId: number;
  name: string;
  description: string | null;
  language: string | null;
  htmlUrl: string;
  readme: string | null;
}

export interface BlogMain {
  username: string;
  name: string | null;
  avatarUrl: string | null;
  repos: BlogRepo[];
}

export async function getBlogMain(username: string): Promise<BlogMain> {
  const res = await fetch(`${API_BASE_URL}/api/blog/${username}`);
  if (res.status === 404) throw new Error("User not found");
  if (!res.ok) throw new Error("Failed to fetch blog");
  return res.json();
}
