'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function FeedbackPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  if (!session) {
    router.push('/');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      showToast('Please enter your feedback', 'error');
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_BASE}/feedback`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.token}`,
          },
        }
      );

      showToast('Feedback submitted successfully! Thank you.', 'success');
      setText('');
    } catch (error) {
      showToast('Failed to submit feedback', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Send Feedback
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We'd love to hear your thoughts, suggestions, or any issues you've encountered.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label
                htmlFor="feedback"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Your Feedback
              </label>
              <textarea
                id="feedback"
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Tell us what's on your mind..."
                maxLength={5000}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {text.length} / 5000 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !text.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            } animate-fade-in`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
