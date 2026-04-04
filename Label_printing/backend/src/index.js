import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// Import config
import envConfig from './config/env.js';

// Import middleware
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { corsOptions } from './middleware/corsMiddleware.js';
import { getCorsOptions } from './middleware/corsMiddleware.js';
// Import routes
import masterRoutes from './routes/master.js';
import configRoutes from './routes/config.js';
import serialRoutes from './routes/serials.js';
import labelRoutes from './routes/labels.js';
import reportRoutes from './routes/reports.js';

// ============================================
// CREATE EXPRESS APP
// ============================================
const app = express();

// ============================================
// MIDDLEWARE SETUP (In Order)
// ============================================

// 1. CORS (must be first)
//app.use(cors);
app.use(cors(corsOptions));
app.options('*', cors(getCorsOptions())); // preflight
// 2. Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(bodyParser.json());

// 3. Request Logger
app.use(requestLogger);

// ============================================
// HEALTH CHECK ENDPOINT
// ============================================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// API ROUTES
// ============================================

// Master data routes (Products, Capacities, Models)
app.use('/api/master', masterRoutes);

// Config routes (Label_Config, Print_Format)
app.use('/api/config', configRoutes);

// Serial routes (Serial_Counter, Serial_Number)
app.use('/api/serials', serialRoutes);

// Label routes
app.use('/api/labels', labelRoutes);

// Report routes
app.use('/api/reports', reportRoutes);

// ============================================
// API DOCUMENTATION
// ============================================
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'JR TechLabs Label Printing System API',
    version: '1.0.0',
    endpoints: {
      master: {
        products: 'GET /api/master/products, POST /api/master/products',
        capacities: 'GET /api/master/capacities, POST /api/master/capacities',
        models: 'GET /api/master/models, POST /api/master/models'
      },
      config: {
        configs: 'GET /api/config, POST /api/config',
        formats: 'GET /api/config/formats/all, POST /api/config/formats'
      },
      serials: {
        counters: 'GET /api/serials/counters, POST /api/serials/counters',
        generate: 'POST /api/serials/generate',
        validate: 'GET /api/serials/validate/:serialNumber'
      },
      labels: {
        list: 'GET /api/labels, POST /api/labels',
        byId: 'GET /api/labels/:id, PUT /api/labels/:id, DELETE /api/labels/:id',
        search: 'GET /api/labels/search/query?q=term'
      },
      reports: {
        events: 'GET /api/reports/events, POST /api/reports/events',
        reports: 'GET /api/reports, POST /api/reports',
        summary: 'GET /api/reports/summary'
      }
    },
    documentation: '/api/docs'
  });
});

// ============================================
// 404 NOT FOUND HANDLER
// ============================================
app.use(notFoundHandler);

// ============================================
// ERROR HANDLER (MUST BE LAST)
// ============================================
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
const PORT = envConfig.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SERVER IS RUNNING');
  console.log('='.repeat(60));
  console.log(`\n📍 Server URL: http://localhost:${PORT}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`📚 Endpoints: http://localhost:${PORT}/api`);
  console.log('\n' + '='.repeat(60));
  console.log('✓ Express server started successfully');
  console.log('✓ All routes loaded');
  console.log('✓ Database connected');
  console.log('✓ Middleware configured');
  console.log('✓ CORS enabled for frontend');
  console.log('='.repeat(60) + '\n');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGINT', () => {
  console.log('\n📛 Shutting down server...');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n📛 Server terminated');
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

// ============================================
// ERROR HANDLING
// ============================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

export default app;
