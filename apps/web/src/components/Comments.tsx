import { useState } from 'react';
import { Send } from 'lucide-react';
import type { Comment } from '@/hooks/usePostInteractions';

type Props = {
  comments: Comment[];
  onAdd: (text: string) => void;
  showAll?: boolean;
};

export default function Comments({ comments, onAdd, showAll = false }: Props) {
  const [text, setText] = useState('');
  const [showAllComments, setShowAllComments] = useState(showAll);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAdd(text);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const displayComments = showAllComments ? comments : comments.slice(0, 3);
  const hasMore = comments.length > 3;

  return (
    <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
      {/* Comment Input */}
      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={!text.trim()}
          aria-label="Post comment"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Comments List */}
      {comments.length > 0 && (
        <ul className="space-y-3">
          {displayComments.map((comment) => (
            <li key={comment.id} className="text-sm">
              <div className="flex items-start gap-2">
                {comment.author.image && (
                  <img
                    src={comment.author.image}
                    alt={comment.author.handle}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {comment.author.name || comment.author.handle}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      @{comment.author.handle}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Show More Button */}
      {hasMore && !showAllComments && (
        <button
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 mt-3 font-medium"
          onClick={() => setShowAllComments(true)}
        >
          Show {comments.length - 3} more comment{comments.length - 3 > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}
