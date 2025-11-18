'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Code2, Plus, LogIn, LogOut } from 'lucide-react';

export function NavBar() {
  const { data: session } = useSession();

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
            </div>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <>
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
