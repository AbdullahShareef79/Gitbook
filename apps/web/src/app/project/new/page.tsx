'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function NewProject() {
  const { data: session } = useSession();
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError('Please sign in first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/projects/from-github`,
        { githubUrl: url },
        { withCredentials: true },
      );

      // Create repo card post
      await axios.post(
        `${API_URL}/posts/repo-card`,
        { projectId: response.data.id },
        { withCredentials: true },
      );

      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="max-w-xl mx-auto p-6 text-center">
        <p className="mb-4">Please sign in to create a repo card</p>
        <a
          href="/api/auth/signin"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create AI Repo Card</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-2">
            GitHub Repository URL
          </label>
          <input
            id="url"
            type="url"
            className="w-full px-3 py-2 border border-input rounded-md bg-background"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50"
          disabled={!url || loading}
        >
          {loading ? 'Processing...' : 'Generate Repo Card'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-muted rounded-md text-sm text-muted-foreground">
        <p className="font-medium mb-2">What happens next:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>We&apos;ll fetch your repository metadata</li>
          <li>AI will generate a summary and highlights</li>
          <li>Your repo card will appear in the feed</li>
        </ul>
      </div>
    </div>
  );
}
