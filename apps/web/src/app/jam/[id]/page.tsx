'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useParams } from 'next/navigation';
import AiToolbar from '@/components/AiToolbar';
import { Save, Users } from 'lucide-react';

const WS_URL = process.env.NEXT_PUBLIC_COLLAB_WS_URL || 'ws://localhost:1234';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface AwarenessUser {
  handle: string;
  name: string;
  color: string;
  cursor?: { line: number; column: number };
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52C7B8'
];

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
  const [connectedUsers, setConnectedUsers] = useState<Map<number, AwarenessUser>>(new Map());
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  useEffect(() => {
    const doc = new Y.Doc();
    
    // Load snapshot BEFORE connecting provider
    loadSnapshot(doc).then(() => {
      // Now connect to WebSocket
      const wsProvider = new WebsocketProvider(WS_URL, params.id as string, doc);

      wsProvider.on('status', (event: any) => {
        setConnected(event.status === 'connected');
      });

      // Set up awareness for presence
      if (session?.user) {
        const user = session.user as any;
        const userColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        
        wsProvider.awareness.setLocalStateField('user', {
          handle: user.handle || user.email?.split('@')[0] || 'Anonymous',
          name: user.name || 'Anonymous User',
          color: userColor,
        });
      }

      // Listen to awareness changes
      wsProvider.awareness.on('change', () => {
        const states = wsProvider.awareness.getStates();
        const users = new Map<number, AwarenessUser>();
        
        states.forEach((state: any, clientId: number) => {
          if (state.user && clientId !== wsProvider.awareness.clientID) {
            users.set(clientId, state.user);
          }
        });
        
        setConnectedUsers(users);
        updateCursorDecorations(users);
      });

      setYdoc(doc);
      setProvider(wsProvider);
    });

    return () => {
      if (provider) {
        provider.destroy();
      }
      doc.destroy();
    };
  }, [params.id, session]);

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

  const updateCursorDecorations = (users: Map<number, AwarenessUser>) => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const decorations: any[] = [];

    users.forEach((user) => {
      if (user.cursor) {
        decorations.push({
          range: {
            startLineNumber: user.cursor.line,
            startColumn: user.cursor.column,
            endLineNumber: user.cursor.line,
            endColumn: user.cursor.column + 1,
          },
          options: {
            className: 'remote-cursor',
            beforeContentClassName: 'remote-cursor-label',
            beforeContentStyle: `background-color: ${user.color}; content: "${user.handle}"`,
            stickiness: 1,
          },
        });
      }
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, decorations);
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

    // Update awareness with cursor position
    editor.onDidChangeCursorPosition((e: any) => {
      if (provider?.awareness) {
        provider.awareness.setLocalStateField('user', {
          ...provider.awareness.getLocalState()?.user,
          cursor: {
            line: e.position.lineNumber,
            column: e.position.column,
          },
        });
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
          {connectedUsers.size > 0 && (
            <div className="flex items-center gap-2 ml-4">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div className="flex -space-x-2">
                {Array.from(connectedUsers.values()).map((user, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white border-2 border-background"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                  >
                    {user.handle.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {connectedUsers.size} {connectedUsers.size === 1 ? 'user' : 'users'} online
              </span>
            </div>
          )}
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
