// API client wrapper for all post interactions
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function req(path: string, init?: RequestInit) {
  const r = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json().catch(() => ({}));
}

export const PostApi = {
  like: (id: string) => req(`/posts/${id}/like`, { method: 'POST' }),
  bookmark: (id: string) => req(`/posts/${id}/bookmark`, { method: 'POST' }),
  comment: (id: string, content: string) =>
    req(`/posts/${id}/comment`, { method: 'POST', body: JSON.stringify({ content }) }),
  interactions: (id: string) => req(`/posts/${id}/interactions`),
  removeInteraction: (id: string, kind: 'LIKE' | 'BOOKMARK' | 'COMMENT') =>
    req(`/posts/${id}/interaction`, { method: 'DELETE', body: JSON.stringify({ kind }) }),
};
