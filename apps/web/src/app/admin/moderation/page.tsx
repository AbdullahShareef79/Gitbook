'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import useSWRInfinite from 'swr/infinite';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Flag {
  id: string;
  user_id: string;
  post_id: string;
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  created_at: string;
  reporter_name?: string;
  reporter_handle?: string;
  post_content?: any;
}

interface FlagResponse {
  items: Flag[];
  nextCursor: string | null;
}

const fetcher = async (url: string) => {
  const token = localStorage.getItem('token');
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export default function ModerationPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('OPEN');

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAdmin(response.data.role === 'ADMIN');
    } catch (error) {
      console.error('Failed to check admin status:', error);
      setIsAdmin(false);
    }
  };

  const getKey = (pageIndex: number, previousPageData: FlagResponse | null) => {
    if (previousPageData && !previousPageData.nextCursor) return null;
    
    const cursor = previousPageData?.nextCursor || '';
    return `${API_URL}/flags?cursor=${cursor}&limit=20&status=${statusFilter}`;
  };

  const { data, error, size, setSize, mutate } = useSWRInfinite<FlagResponse>(
    isAdmin ? getKey : () => null,
    fetcher,
    { revalidateFirstPage: false }
  );

  const flags = data ? data.flatMap(page => page.items) : [];
  const isLoadingInitial = !data && !error && isAdmin;
  const isLoadingMore = isLoadingInitial || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.items.length === 0;
  const isReachingEnd = isEmpty || (data && data[data.length - 1]?.nextCursor === null);

  const handleAction = async (flagId: string, action: 'resolve' | 'dismiss') => {
    try {
      const token = localStorage.getItem('token');
      
      if (action === 'resolve') {
        await axios.post(
          `${API_URL}/flags/${flagId}/resolve`,
          { status: 'RESOLVED' },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/flags/${flagId}/dismiss`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Revalidate the data
      mutate();
    } catch (error) {
      console.error(`Failed to ${action} flag:`, error);
      alert(`Failed to ${action} flag`);
    }
  };

  // Loading state
  if (isAdmin === null) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Not admin - lock screen
  if (!isAdmin) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Admin Access Required</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
        <p className="text-muted-foreground mt-2">Review and manage content flags</p>
      </div>

      {/* Filter Tabs */}
      <div className="border-b mb-6">
        <div className="flex gap-4">
          {['OPEN', 'RESOLVED', 'DISMISSED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`pb-3 px-2 font-medium transition-colors relative ${
                statusFilter === status
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {status}
              {statusFilter === status && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Flags List */}
      {isLoadingInitial ? (
        <div className="text-center py-12">Loading flags...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">Failed to load flags</div>
      ) : isEmpty ? (
        <div className="text-center py-12 text-muted-foreground">
          No {statusFilter.toLowerCase()} flags found
        </div>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <div key={flag.id} className="border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      flag.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                      flag.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {flag.status}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Reported by @{flag.reporter_handle || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(flag.created_at).toLocaleString()}
                  </p>
                </div>
                {flag.status === 'OPEN' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(flag.id, 'resolve')}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleAction(flag.id, 'dismiss')}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-muted rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-2">Reason</h3>
                <p className="text-sm">{flag.reason}</p>
              </div>

              {flag.post_content && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">Flagged Post</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(flag.post_content, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}

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
      )}
    </div>
  );
}
