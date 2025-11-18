import { useEffect, useState, useCallback } from 'react';
import { PostApi } from '../lib/api';

export type Comment = {
  id: string;
  author: { handle: string; name?: string; image?: string };
  content: string;
  createdAt: string;
};

export type Interactions = {
  liked: boolean;
  bookmarked: boolean;
  likeCount: number;
  bookmarkCount: number;
  commentCount: number;
  comments: Comment[];
};

export function usePostInteractions(postId: string) {
  const [data, setData] = useState<Interactions | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await PostApi.interactions(postId);
      // Transform API response to expected format
      setData({
        liked: res.userInteracted?.liked || false,
        bookmarked: res.userInteracted?.bookmarked || false,
        likeCount: res.counts?.LIKE || 0,
        bookmarkCount: res.counts?.BOOKMARK || 0,
        commentCount: res.counts?.COMMENT || 0,
        comments: res.comments || [],
      });
    } catch (error) {
      console.error('Failed to fetch interactions:', error);
      // Set default empty state on error
      setData({
        liked: false,
        bookmarked: false,
        likeCount: 0,
        bookmarkCount: 0,
        commentCount: 0,
        comments: [],
      });
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleLike = async () => {
    if (!data) return;
    // Optimistic update
    const optimistic = {
      ...data,
      liked: !data.liked,
      likeCount: data.likeCount + (data.liked ? -1 : 1),
    };
    setData(optimistic);
    try {
      await PostApi.like(postId);
    } catch (error) {
      // Rollback on error
      setData(data);
      console.error('Failed to toggle like:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!data) return;
    // Optimistic update
    const optimistic = {
      ...data,
      bookmarked: !data.bookmarked,
      bookmarkCount: data.bookmarkCount + (data.bookmarked ? -1 : 1),
    };
    setData(optimistic);
    try {
      await PostApi.bookmark(postId);
    } catch (error) {
      // Rollback on error
      setData(data);
      console.error('Failed to toggle bookmark:', error);
    }
  };

  const addComment = async (text: string) => {
    if (!data || !text.trim()) return;
    const tempId = `temp_${Date.now()}`;
    // Optimistic update
    const optimistic = {
      ...data,
      commentCount: data.commentCount + 1,
      comments: [
        {
          id: tempId,
          author: { handle: 'you', name: 'You' },
          content: text,
          createdAt: new Date().toISOString(),
        },
        ...data.comments,
      ],
    };
    setData(optimistic);
    try {
      await PostApi.comment(postId, text);
      // Refresh to get real comment data
      await refresh();
    } catch (error) {
      // Rollback on error
      setData(data);
      console.error('Failed to add comment:', error);
    }
  };

  return { data, loading, toggleLike, toggleBookmark, addComment, refresh };
}
