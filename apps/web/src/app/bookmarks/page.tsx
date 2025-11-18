'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RepoCard } from '@/components/RepoCard';
import { useInfiniteFeed } from '@/hooks/useInfiniteFeed';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Post {
  id: string;
  content: any;
  author: any;
  project: any;
  createdAt: string;
}

export default function BookmarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token = session?.user ? (session as any).accessToken : null;

  const { items: posts, isLoadingInitial, isLoadingMore, hasMore, loadMore } = useInfiniteFeed<Post>(
    `${API_URL}/users/me/bookmarks`,
    { limit: 10, token }
  );

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: '300px' }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loadMore]);

  if (status === 'loading' || isLoadingInitial) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bookmarks</h1>
        <p className="text-muted-foreground">
          Posts you've saved for later
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No bookmarks yet</p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90"
          >
            Explore the feed
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {posts.map((post) => (
              <RepoCard key={post.id} post={post} />
            ))}
          </div>

          {/* Load more trigger */}
          <div ref={loadMoreRef} className="py-8 text-center">
            {isLoadingMore && <div className="text-muted-foreground">Loading more...</div>}
            {!hasMore && posts.length > 0 && (
              <div className="text-muted-foreground">No more bookmarks</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
