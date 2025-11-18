import { Heart, Bookmark, MessageSquare } from 'lucide-react';

type Props = {
  likeCount: number;
  liked: boolean;
  onLike: () => void;
  bookmarkCount: number;
  bookmarked: boolean;
  onBookmark: () => void;
  commentCount: number;
  onCommentClick: () => void;
};

export default function InteractionBar({
  likeCount,
  liked,
  onLike,
  bookmarkCount,
  bookmarked,
  onBookmark,
  commentCount,
  onCommentClick,
}: Props) {
  const baseClass = 'inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors';
  const hoverClass = 'hover:bg-gray-100 dark:hover:bg-gray-800';
  const likeClass = liked ? 'text-rose-600 bg-rose-50 dark:bg-rose-900/20' : '';
  const bookmarkClass = bookmarked ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20' : '';

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        className={`${baseClass} ${hoverClass} ${likeClass}`}
        onClick={onLike}
        aria-label={liked ? 'Unlike' : 'Like'}
      >
        <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
        <span className="font-medium">{likeCount}</span>
      </button>

      <button
        className={`${baseClass} ${hoverClass} ${bookmarkClass}`}
        onClick={onBookmark}
        aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
      >
        <Bookmark size={18} fill={bookmarked ? 'currentColor' : 'none'} />
        <span className="font-medium">{bookmarkCount}</span>
      </button>

      <button
        className={`${baseClass} ${hoverClass}`}
        onClick={onCommentClick}
        aria-label="Comments"
      >
        <MessageSquare size={18} />
        <span className="font-medium">{commentCount}</span>
      </button>
    </div>
  );
}
