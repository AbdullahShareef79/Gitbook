'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useParams } from 'next/navigation';
import AiToolbar from '@/components/AiToolbar';
import { Save } from 'lucide-react';

const WS_URL = process.env.NEXT_PUBLIC_COLLAB_WS_URL || 'ws://localhost:1234';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function JamPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [ydoc, setYdoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<WebsocketProvider | null>(null);
  const [connected, setConnected] = useState(false);
  const [selectedCode, setSelectedCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const doc = new Y.Doc();
    const wsProvider = new WebsocketProvider(WS_URL, params.id as string, doc);

    wsProvider.on('status', (event: any) => {
      setConnected(event.status === 'connected');
    });

    setYdoc(doc);
    setProvider(wsProvider);

    // Load latest snapshot
    loadSnapshot(doc);

    return () => {
      wsProvider.destroy();
      doc.destroy();
    };
  }, [params.id]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!ydoc || !session) return;

    const interval = setInterval(() => {
      saveSnapshot();
    }, 30000);

    return () => clearInterval(interval);
  }, [ydoc, session]);

  // Keyboard shortcut: Ctrl/Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSnapshot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ydoc, session]);

  const loadSnapshot = async (doc: Y.Doc) => {
    try {
      const res = await fetch(`${API_URL}/jams/${params.id}/snapshot`);
      const { snapshot } = await res.json();
      
      if (snapshot) {
        const update = Uint8Array.from(Buffer.from(snapshot, 'base64'));
        Y.applyUpdate(doc, update);
      }
    } catch (err) {
      console.error('Failed to load snapshot:', err);
    }
  };

  const saveSnapshot = async () => {
    if (!ydoc || !session || saving) return;

    setSaving(true);
    try {
      const update = Y.encodeStateAsUpdate(ydoc);
      const base64 = Buffer.from(update).toString('base64');

      await fetch(`${API_URL}/jams/${params.id}/snapshot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
        body: JSON.stringify({ update: base64 }),
      });

      setLastSaved(new Date());
    } catch (err) {
      console.error('Failed to save snapshot:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Track selection changes
    editor.onDidChangeCursorSelection((e: any) => {
      const selection = editor.getModel()?.getValueInRange(e.selection);
      if (selection) {
        setSelectedCode(selection);
      }
    });
  };

  const handleInsertCode = (code: string) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      editor.executeEdits('ai-assist', [{
        range: selection,
        text: code,
      }]);
    }
  };

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Sign in to join this jam session</p>
          <a
            href="/api/auth/signin"
            className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      <div className="border-b px-4 py-2 flex items-center justify-between bg-background">
        <div className="flex items-center gap-2">
          <h1 className="font-semibold">Code Jam</h1>
          <span
            className={`text-xs px-2 py-1 rounded ${
              connected
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {connected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={saveSnapshot}
            disabled={saving}
            className="flex items-center gap-1 text-sm px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-50"
            title="Save snapshot (Ctrl/Cmd+S)"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          {lastSaved && (
            <span className="text-xs text-muted-foreground">
              Saved {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <div className="text-sm text-muted-foreground">
            Room: {params.id}
          </div>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage={language}
          defaultValue="// Welcome to the Jam!\n// Start coding together...\n"
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>

      {/* AI Assistant Toolbar */}
      <AiToolbar
        selectedCode={selectedCode}
        language={language}
        onInsertCode={handleInsertCode}
      />
    </div>
  );
}
