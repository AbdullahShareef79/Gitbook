'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useInfiniteFeed } from '@/hooks/useInfiniteFeed';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Notification {
  id: string;
  type: 'LIKE' | 'BOOKMARK' | 'COMMENT' | 'FOLLOW' | 'JAM_INVITE';
  refId: string;
  meta: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPopover({ isOpen, onClose }: NotificationPopoverProps) {
  const { data: session } = useSession();
  const token = session?.user ? (session as any).accessToken : null;

  const { items: notifications, isLoadingInitial, isLoadingMore, hasMore, loadMore, mutate } = useInfiniteFeed<Notification>(
    `${API_URL}/notifications`,
    { limit: 20, token }
  );

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen || !loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: '100px' }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isOpen, hasMore, isLoadingMore, loadMore]);

  // Mark unread notifications as read when popover opens
  useEffect(() => {
    if (isOpen && notifications.length > 0 && token) {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
      if (unreadIds.length > 0) {
        fetch(`${API_URL}/notifications/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notificationIds: unreadIds }),
        }).then(() => mutate());
      }
    }
  }, [isOpen, notifications, token, mutate]);

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case 'LIKE':
      case 'BOOKMARK':
      case 'COMMENT':
        return `/post/${notification.refId}`;
      case 'FOLLOW':
        return `/profile/${notification.meta?.handle || notification.refId}`;
      case 'JAM_INVITE':
        return `/jam/${notification.refId}`;
      default:
        return '/';
    }
  };

  const getNotificationText = (notification: Notification) => {
    switch (notification.type) {
      case 'LIKE':
        return 'liked your post';
      case 'BOOKMARK':
        return 'bookmarked your post';
      case 'COMMENT':
        return 'commented on your post';
      case 'FOLLOW':
        return 'started following you';
      case 'JAM_INVITE':
        return 'invited you to a jam';
      default:
        return 'interacted with you';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-0 w-96 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 max-h-[600px] overflow-y-auto">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold">Notifications</h3>
      </div>

      {isLoadingInitial ? (
        <div className="p-4 text-center text-muted-foreground">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">No notifications yet</div>
      ) : (
        <>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href={getNotificationLink(notification)}
                onClick={onClose}
                className={`block p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{notification.meta?.userName || 'Someone'}</span>{' '}
                      {getNotificationText(notification)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div ref={loadMoreRef} className="p-4 text-center">
            {isLoadingMore && <div className="text-sm text-muted-foreground">Loading more...</div>}
            {!hasMore && notifications.length > 0 && (
              <div className="text-sm text-muted-foreground">No more notifications</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
