export type Cursor = { createdAt: string; id: string; rank_score?: number };

export const encodeCursor = (c: Cursor): string => {
  return Buffer.from(JSON.stringify(c)).toString('base64url');
};

export const decodeCursor = (s?: string): Cursor | null => {
  if (!s) return null;
  try {
    return JSON.parse(Buffer.from(s, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
};
