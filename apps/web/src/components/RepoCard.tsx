'use client';

import { ExternalLink, Code2, Users } from 'lucide-react';
import { useState } from 'react';
import InteractionBar from './InteractionBar';
import Comments from './Comments';
import { usePostInteractions } from '@/hooks/usePostInteractions';

interface RepoCardProps {
  post: {
    id: string;
    content: {
      projectId: string;
      title: string;
      summary: string[];
      githubUrl: string;
      tags: string[];
    };
    author: {
      id: string;
      handle: string;
      name: string;
      image?: string;
    };
    createdAt: string;
  };
}

export function RepoCard({ post }: RepoCardProps) {
  const { content, author } = post;
  const { data, loading, toggleLike, toggleBookmark, addComment } = usePostInteractions(post.id);
  const [showComments, setShowComments] = useState(false);

  return (
    <div className="border rounded-lg p-6 bg-card hover:shadow-md transition">
      <div className="flex items-start gap-3 mb-4">
        {author.image && (
          <img
            src={author.image}
            alt={author.name}
            className="w-10 h-10 rounded-full"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <a
              href={`/profile/${author.handle}`}
              className="font-semibold hover:underline"
            >
              {author.name}
            </a>
            <span className="text-muted-foreground text-sm">
              @{author.handle}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Code2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{content.title}</h3>
          <a
            href={content.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {content.summary && content.summary.length > 0 && (
          <ul className="space-y-1 text-sm text-muted-foreground mb-3">
            {content.summary.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}

        {content.tags && content.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {content.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <a
          href={`/jam/${content.projectId}`}
          className="flex items-center gap-2 px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm hover:opacity-90"
        >
          <Users className="w-4 h-4" />
          Join Jam
        </a>
      </div>

      {/* Interactions */}
      {!loading && data && (
        <>
          <InteractionBar
            likeCount={data.likeCount}
            liked={data.liked}
            onLike={toggleLike}
            bookmarkCount={data.bookmarkCount}
            bookmarked={data.bookmarked}
            onBookmark={toggleBookmark}
            commentCount={data.commentCount}
            onCommentClick={() => setShowComments(!showComments)}
          />
          {showComments && <Comments comments={data.comments} onAdd={addComment} />}
        </>
      )}
    </div>
  );
}
