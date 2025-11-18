'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [params.handle]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/profile/${params.handle}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="flex items-start gap-4">
          {profile.image && (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-20 h-20 rounded-full"
            />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">@{profile.handle}</p>
            {profile.headline && (
              <p className="mt-2">{profile.headline}</p>
            )}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.skills.map((skill: string) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Projects</h2>
        {profile.projects && profile.projects.length > 0 ? (
          <div className="grid gap-4">
            {profile.projects.map((project: any) => (
              <div key={project.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {project.summary}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-muted text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No projects yet</p>
        )}
      </div>
    </div>
  );
}
