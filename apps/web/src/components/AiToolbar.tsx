'use client';

import { useState } from 'react';
import { Sparkles, TestTube, Wrench, Zap, FileText } from 'lucide-react';

interface AiToolbarProps {
  selectedCode: string;
  language: string;
  onInsertCode: (code: string) => void;
}

export default function AiToolbar({ selectedCode, language, onInsertCode }: AiToolbarProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleAiAction = async (action: 'explain' | 'test' | 'fix' | 'optimize' | 'document') => {
    if (!selectedCode || selectedCode.trim().length === 0) {
      alert('Please select some code first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/jam-assist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth token
        },
        body: JSON.stringify({
          action,
          code: selectedCode,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('AI request failed');
      }

      const data = await response.json();
      setResult(data.suggestion);

      // Auto-insert for test/optimize/fix actions
      if (['test', 'optimize', 'fix'].includes(action)) {
        onInsertCode(data.suggestion);
      }
    } catch (error) {
      console.error('AI assist error:', error);
      alert('Failed to get AI assistance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-gray-900 border-t border-gray-700">
      {/* AI Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-400 font-medium">🤖 AI Assistant:</span>
        
        <button
          onClick={() => handleAiAction('explain')}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition"
        >
          <Sparkles size={14} />
          Explain
        </button>

        <button
          onClick={() => handleAiAction('test')}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition"
        >
          <TestTube size={14} />
          Generate Tests
        </button>

        <button
          onClick={() => handleAiAction('fix')}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition"
        >
          <Wrench size={14} />
          Suggest Fix
        </button>

        <button
          onClick={() => handleAiAction('optimize')}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition"
        >
          <Zap size={14} />
          Optimize
        </button>

        <button
          onClick={() => handleAiAction('document')}
          disabled={loading}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded transition"
        >
          <FileText size={14} />
          Add Docs
        </button>

        {loading && (
          <span className="text-sm text-gray-400 ml-2 animate-pulse">
            Thinking...
          </span>
        )}
      </div>

      {/* AI Result Display */}
      {result && (
        <div className="mt-2 p-3 bg-gray-800 rounded border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">AI Suggestion:</span>
            <button
              onClick={() => setResult(null)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <pre className="text-sm text-gray-100 whitespace-pre-wrap font-mono overflow-auto max-h-64">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
