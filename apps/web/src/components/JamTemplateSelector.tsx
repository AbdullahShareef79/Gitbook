'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface JamTemplate {
  id: string;
  title: string;
  description: string;
  language: string;
  starterCode: string;
}

interface JamTemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JamTemplateSelector({ isOpen, onClose }: JamTemplateSelectorProps) {
  const router = useRouter();
  const [templates, setTemplates] = useState<JamTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<JamTemplate | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/jam-templates`);
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartJam = async (templateId?: string) => {
    setCreating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/jams`,
        { templateId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const jamId = response.data.id;
      router.push(`/jam/${jamId}`);
      onClose();
    } catch (error) {
      console.error('Failed to create jam:', error);
      alert('Failed to start jam session');
    } finally {
      setCreating(false);
    }
  };

  const languages = ['all', ...new Set(templates.map(t => t.language))];
  const filteredTemplates = selectedLanguage === 'all' 
    ? templates 
    : templates.filter(t => t.language === selectedLanguage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-card border rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Start a Jam Session</h2>
            <p className="text-muted-foreground mt-1">Choose a template or start from scratch</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="text-center py-12">Loading templates...</div>
          ) : (
            <>
              {/* Language Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Filter by Language</label>
                <div className="flex flex-wrap gap-2">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedLanguage === lang
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {lang === 'all' ? 'All' : lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start from Scratch */}
              <div className="mb-6">
                <button
                  onClick={() => handleStartJam()}
                  disabled={creating}
                  className="w-full p-4 border-2 border-dashed rounded-lg hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50 text-left"
                >
                  <h3 className="font-semibold text-lg">Start from Scratch</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Begin with an empty editor and code freely
                  </p>
                </button>
              </div>

              {/* Templates Grid */}
              <div>
                <h3 className="font-semibold mb-3">Templates</h3>
                {filteredTemplates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No templates found for this language
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{template.title}</h4>
                          <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                            {template.language}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          {template.description}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPreviewTemplate(template)}
                            className="flex-1 px-3 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm font-medium"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleStartJam(template.id)}
                            disabled={creating}
                            className="flex-1 px-3 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium disabled:opacity-50"
                          >
                            Use Template
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70" onClick={() => setPreviewTemplate(null)}>
            <div 
              className="bg-card border rounded-lg max-w-3xl w-full max-h-[80vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{previewTemplate.title}</h3>
                  <p className="text-sm text-muted-foreground">{previewTemplate.language}</p>
                </div>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                <p className="text-sm mb-4">{previewTemplate.description}</p>
                <div className="bg-muted rounded-lg p-4 overflow-auto">
                  <pre className="text-sm">
                    <code>{previewTemplate.starterCode}</code>
                  </pre>
                </div>
              </div>
              <div className="border-t p-4 flex gap-2 justify-end">
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-md"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleStartJam(previewTemplate.id);
                    setPreviewTemplate(null);
                  }}
                  disabled={creating}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md disabled:opacity-50"
                >
                  Use This Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
