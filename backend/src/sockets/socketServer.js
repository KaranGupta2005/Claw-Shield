/**
 * Socket Server - WebSocket configuration and setup
 */

import { Server } from 'socket.io';
import logger from '../core/logger.js';
import { setupAgentSocket } from './agentSocket.js';

/**
 * Initialize Socket.IO server
 */
export function initializeSocketServer(httpServer, eventBus) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.CLIENT_URL,
      ].filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Connection handler
  io.on('connection', (socket) => {
    logger.info('🔌 Client connected to socket', {
      socketId: socket.id,
      transport: socket.conn.transport.name,
    });

    socket.on('disconnect', (reason) => {
      logger.info('🔌 Client disconnected', {
        socketId: socket.id,
        reason,
      });
    });

    // Send welcome message
    socket.emit('notification', {
      type: 'INFO',
      title: 'Connected to Claw Shield',
      message: 'Real-time agent monitoring active',
      timestamp: new Date().toISOString(),
    });
  });

  // Setup agent activity broadcasting
  setupAgentSocket(io, eventBus);

  logger.info('✅ Socket.IO server initialized');

  return io;
}
