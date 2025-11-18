import { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/posts/${params.id}`, { cache: 'no-store' });
    const post = await res.json();

    const title = post.project?.name || 'Project on Dev Social';
    const description = post.project?.description || 'Check out this project on Dev Social';

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: `${APP_URL}/api/og?t=${encodeURIComponent(title)}&s=${encodeURIComponent(description)}`,
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${APP_URL}/api/og?t=${encodeURIComponent(title)}&s=${encodeURIComponent(description)}`],
      },
    };
  } catch (error) {
    return {
      title: 'Post on Dev Social',
      description: 'AI-Powered Developer Social Network',
    };
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  try {
    const res = await fetch(`${API_URL}/posts/${params.id}`, { cache: 'no-store' });
    const post = await res.json();

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to Feed
          </a>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{post.project?.name || 'Project'}</h1>
          <p className="text-gray-600 mb-6">{post.project?.description}</p>
          
          {post.project?.githubUrl && (
            <a
              href={post.project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800"
            >
              View on GitHub
            </a>
          )}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-red-600">Failed to load post</p>
      </div>
    );
  }
}
