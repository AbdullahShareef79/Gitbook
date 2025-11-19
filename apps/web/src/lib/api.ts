// API client wrapper for all post interactions
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function req(path: string, init?: RequestInit, token?: string | null) {
  const headers: HeadersInit = { 
    'Content-Type': 'application/json',
    ...(init?.headers || {}) 
  };
  
  // Add token to headers if provided
  if (token && typeof headers === 'object' && !Array.isArray(headers)) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const r = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers,
    ...init,
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json().catch(() => ({}));
}

export const PostApi = {
  like: (id: string, token?: string | null) => req(`/posts/${id}/like`, { method: 'POST' }, token),
  bookmark: (id: string, token?: string | null) => req(`/posts/${id}/bookmark`, { method: 'POST' }, token),
  comment: (id: string, content: string, token?: string | null) =>
    req(`/posts/${id}/comment`, { method: 'POST', body: JSON.stringify({ content }) }, token),
  interactions: (id: string, token?: string | null) => req(`/posts/${id}/interactions`, undefined, token),
  removeInteraction: (id: string, kind: 'LIKE' | 'BOOKMARK' | 'COMMENT', token?: string | null) =>
    req(`/posts/${id}/interaction`, { method: 'DELETE', body: JSON.stringify({ kind }) }, token),
};
