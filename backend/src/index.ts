import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { Server as WebSocketServer, WebSocket } from 'ws';
import { connectMongoDB } from './db/mongodb';
import { connectRedis } from './db/redis';
import { authRouter } from './routes/auth';
import { roomsRouter } from './routes/rooms';
import { authMiddleware } from './middleware/auth';
import { WebSocketService } from './services/websocket.service';

const app = new Hono();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.route('/auth', authRouter);
app.route('/rooms', roomsRouter);

app.get('/protected', authMiddleware, (c) => {
  const user = c.get('user');
  return c.json({ message: 'Protected route', user });
});

async function main() {
  console.log('Starting chat server...');
  
  await connectMongoDB();
  await connectRedis();
  
  const server = serve({
    fetch: app.fetch,
    port: PORT
  });

  const wss = new WebSocketServer({ server, path: '/ws' });
  const webSocketService = new WebSocketService();

  wss.on('connection', (ws: WebSocket, req) => {
    webSocketService.handleConnection(ws, req.url || '');
  });

  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });

  console.log(`HTTP server running on http://localhost:${PORT}`);
  console.log(`WebSocket server running on ws://localhost:${PORT}/ws`);

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    wss.close(() => {
      console.log('WebSocket server closed');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
