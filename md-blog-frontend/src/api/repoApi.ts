const BASE_URL = "";

export interface ConnectedRepo {
  githubRepoId: number;
  name: string;
  description: string | null;
  language: string | null;
  htmlUrl: string;
  pushedAt: string;
  blog: boolean;
  displayOrder: number;
}

export interface GithubRepo {
  githubRepoId: number;
  ownerGithubId: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
  htmlUrl: string;
  defaultBranch: string;
}

export async function getPublicRepos(token: string): Promise<GithubRepo[]> {
  const res = await fetch(`${BASE_URL}/api/repos/public`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch repos");
  return res.json();
}

export async function getConnectedRepos(token: string): Promise<ConnectedRepo[]> {
  const res = await fetch(`${BASE_URL}/api/repos/connected`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch connected repos");
  return res.json();
}

export async function connectRepos(token: string, repos: GithubRepo[]): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/repos/connect`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repos }),
  });
  if (!res.ok) throw new Error("Failed to connect repos");
}

export async function disconnectRepos(token: string, githubRepoIds: number[]): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/repos/disconnect`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ githubRepoIds }),
  });
  if (!res.ok) throw new Error("Failed to disconnect repos");
}

export async function addBlogRepos(token: string, githubRepoIds: number[]): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/blog/repos/add`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ githubRepoIds }),
  });
  if (!res.ok) throw new Error("Failed to add blog repos");
}

export async function removeBlogRepos(token: string, githubRepoIds: number[]): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/blog/repos/remove`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ githubRepoIds }),
  });
  if (!res.ok) throw new Error("Failed to remove blog repos");
}

export async function updateBlogRepoOrder(token: string, orderedGithubRepoIds: number[]): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/blog/repos/order`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderedGithubRepoIds }),
  });
  if (!res.ok) throw new Error("Failed to update blog repo order");
}

export interface TodayFileChange {
  filePath: string;
  changeType: "added" | "modified" | "deleted";
  commitMessage: string;
  additions: number;
  deletions: number;
  time: string;
}

export interface TodayUpdateRepo {
  repoName: string;
  repoFullName: string;
  language: string | null;
  totalAdd: number;
  totalDel: number;
  files: TodayFileChange[];
}

export interface FileDetailCommit {
  sha: string;
  message: string;
  time: string;
  additions: number;
  deletions: number;
  patch: string | null;
  latest: boolean;
}

export interface FileDetail {
  filePath: string;
  repoFullName: string;
  totalAdd: number;
  totalDel: number;
  commits: FileDetailCommit[];
}

export async function getTodayUpdates(token: string): Promise<TodayUpdateRepo[]> {
  const res = await fetch(`${BASE_URL}/api/repos/today-updates`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch today updates");
  return res.json();
}

export async function getFileDetail(
  token: string,
  repoFullName: string,
  filePath: string
): Promise<FileDetail> {
  const params = new URLSearchParams({ repoFullName, filePath });
  const res = await fetch(`${BASE_URL}/api/repos/file-detail?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch file detail");
  return res.json();
}

export interface SummaryResult {
  summary: string;
}

export async function summarizeToday(
  token: string,
  repoFullNames: string[],
  customPrompt: string
): Promise<SummaryResult> {
  const res = await fetch(`${BASE_URL}/api/summary/today`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ repoFullNames, customPrompt }),
  });
  if (!res.ok) throw new Error("Failed to summarize");
  return res.json();
}
