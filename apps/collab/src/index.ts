// @ts-ignore - y-websocket utils don't have types
import { setupWSConnection } from 'y-websocket/bin/utils';
import * as http from 'http';
import * as WebSocket from 'ws';
import 'dotenv/config';

const PORT = process.env.COLLAB_PORT ? Number(process.env.COLLAB_PORT) : 1234;
const server = http.createServer();

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket.WebSocket, req: http.IncomingMessage) => {
  // Rooms inferred from URL: ws://host:1234/<roomId>
  setupWSConnection(ws as any, req as any, { gc: true });
});

server.listen(PORT, () => {
  console.log(`Yjs collab server listening on ws://localhost:${PORT}`);
});
