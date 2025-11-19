'use client';

import { useState } from 'react';
import useSWRInfinite from 'swr/infinite';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface User {
  id: string;
  handle: string;
  name: string;
  image?: string;
  headline?: string;
  isFollowing?: boolean;
}

interface FollowListResponse {
  items: User[];
  nextCursor: string | null;
}

const fetcher = (url: string) => axios.get(url).then(res => res.data);

interface FollowListProps {
  handle: string;
  type: 'followers' | 'following';
  currentUserId?: string;
}

export default function FollowList({ handle, type, currentUserId }: FollowListProps) {
  const [optimisticFollows, setOptimisticFollows] = useState<Record<string, boolean>>({});

  const getKey = (pageIndex: number, previousPageData: FollowListResponse | null) => {
    if (previousPageData && !previousPageData.nextCursor) return null;
    
    const cursor = previousPageData?.nextCursor || '';
    return `${API_URL}/users/profile/${handle}/${type}?cursor=${cursor}&limit=20`;
  };

  const { data, error, size, setSize, mutate } = useSWRInfinite<FollowListResponse>(
    getKey,
    fetcher,
    { revalidateFirstPage: false }
  );

  const users = data ? data.flatMap(page => page.items) : [];
  const isLoadingInitial = !data && !error;
  const isLoadingMore = isLoadingInitial || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.items.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.nextCursor === null);

  const handleFollow = async (userId: string, currentlyFollowing: boolean) => {
    if (!currentUserId) return;

    // Optimistic update
    setOptimisticFollows(prev => ({ ...prev, [userId]: !currentlyFollowing }));

    try {
      const token = localStorage.getItem('token');
      if (currentlyFollowing) {
        await axios.delete(`${API_URL}/users/${userId}/follow`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/users/${userId}/follow`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      // Revalidate the data
      mutate();
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticFollows(prev => ({ ...prev, [userId]: currentlyFollowing }));
      console.error('Follow action failed:', error);
    }
  };

  if (error) {
    return <div className="text-center py-8 text-red-500">Failed to load {type}</div>;
  }

  if (isLoadingInitial) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (isEmpty) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No {type} yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => {
        const isFollowing = optimisticFollows[user.id] ?? user.isFollowing;
        const isCurrentUser = currentUserId === user.id;

        return (
          <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-lg font-semibold">
                    {user.name?.[0]?.toUpperCase() || user.handle[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <a 
                  href={`/profile/${user.handle}`}
                  className="font-semibold hover:underline"
                >
                  {user.name || user.handle}
                </a>
                <p className="text-sm text-muted-foreground">@{user.handle}</p>
                {user.headline && (
                  <p className="text-sm text-muted-foreground mt-1">{user.headline}</p>
                )}
              </div>
            </div>
            {!isCurrentUser && currentUserId && (
              <button
                onClick={() => handleFollow(user.id, isFollowing || false)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  isFollowing
                    ? 'bg-muted hover:bg-muted/80'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>
        );
      })}

      {!isReachingEnd && (
        <div className="text-center py-4">
          <button
            onClick={() => setSize(size + 1)}
            disabled={isLoadingMore}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
