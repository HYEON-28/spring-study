const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export async function getTwitterAuthUrl(token: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/twitter/auth-url`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to get Twitter auth URL");
  const data: { authUrl: string } = await res.json();
  return data.authUrl;
}

export async function postTweet(token: string, text: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/twitter/tweet`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "TWEET_FAILED");
  }
}
