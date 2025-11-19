'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Code2, Plus, LogIn, LogOut, Bell, Zap, Shield } from 'lucide-react';
import { NotificationPopover } from './NotificationPopover';
import JamTemplateSelector from './JamTemplateSelector';
import { useNotificationSSE } from '@/hooks/useNotificationSSE';

export function NavBar() {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showJamModal, setShowJamModal] = useState(false);
  const token = session ? (session as any).accessToken : null;

  // Use SSE for real-time notifications
  const { unreadCount } = useNotificationSSE({
    token,
    onNotification: (notification) => {
      console.log('New notification:', notification);
      // Could trigger a toast notification here
    },
    onUnreadCountChange: (count) => {
      console.log('Unread count updated:', count);
    },
  });

  return (
    <>
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
                  <>
                    <Link
                      href="/bookmarks"
                      className="text-muted-foreground hover:text-foreground transition"
                    >
                      Bookmarks
                    </Link>
                    <Link
                      href="/admin/moderation"
                      className="text-muted-foreground hover:text-foreground transition flex items-center gap-1"
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </Link>
                  </>
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
                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>
                    <NotificationPopover
                      isOpen={showNotifications}
                      onClose={() => setShowNotifications(false)}
                    />
                  </div>
                  <button
                    onClick={() => setShowJamModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700 transition"
                  >
                    <Zap className="w-4 h-4" />
                    Start Jam
                  </button>
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

      {/* Jam Template Selector Modal */}
      <JamTemplateSelector 
        isOpen={showJamModal} 
        onClose={() => setShowJamModal(false)} 
      />
    </>
  );
}
