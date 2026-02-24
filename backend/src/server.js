import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import eventBus from './core/eventBus.js';
import logger from './core/logger.js';

// Import agents for registration
import * as contextAgent from './agents/contextAgent.js';
import * as strategyAgent from './agents/strategyAgent.js';
import * as testAgent from './agents/testAgent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make eventBus available to controllers
app.locals.eventBus = eventBus;

// Connect to database
connectDB();

// Register agents (they attach their event listeners)
logger.info('🚀 Registering agents...');
contextAgent.register(eventBus);
strategyAgent.register(eventBus);
testAgent.register(eventBus);
logger.info('✅ All agents registered');

// Routes
app.get('/', (_, res) => {
  res.json({
    message: 'Claw Shield Backend API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      sessions: '/api/sessions',
    }
  });
});

app.get('/health', (_, res) => {
  res.json({
    status: 'healthy',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    eventBus: {
      registeredEvents: eventBus.getRegisteredEvents().length,
      recentEvents: eventBus.getEventLog(5).length,
    },
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

// 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, _req, res, next) => {
  logger.error('❌ Error:', { message: err.message, stack: err.stack });
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  if (res.headersSent) return next(err);
  
  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

app.listen(PORT, () => {
  logger.info(`✅ Server running on port ${PORT}`);
  logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔔 Event logging: ${process.env.LOG_EVENTS === 'true' ? 'enabled' : 'disabled'}`);
});

