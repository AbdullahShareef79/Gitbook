'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Code2, Plus, LogIn, LogOut, Bell } from 'lucide-react';
import { NotificationPopover } from './NotificationPopover';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function NavBar() {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user) return;

    const token = (session as any).accessToken;
    if (!token) return;

    // Fetch unread count
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch(`${API_URL}/notifications/unread-count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setUnreadCount(data.count || 0);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [session]);

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Code2 className="w-6 h-6" />
              DevSocial
            </Link>
            <div className="hidden md:flex gap-4">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Feed
              </Link>
              <Link
                href="/marketplace"
                className="text-muted-foreground hover:text-foreground transition"
              >
                Marketplace
              </Link>
              {session && (
                <Link
                  href="/bookmarks"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  Bookmarks
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-muted-foreground hover:text-foreground transition"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </button>
                  <NotificationPopover
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>
                <Link
                  href="/project/new"
                  className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                  New Repo Card
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => signIn('github')}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:opacity-90"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
