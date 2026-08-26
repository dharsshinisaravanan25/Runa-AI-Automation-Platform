const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const bcrypt = require('bcryptjs');

const env = require('./config/env');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');
const db = require('./models/dbAdapter');

// Routes
const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');
const integrationRoutes = require('./routes/integrationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server, env.CLIENT_URL);

// Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

const allowedOrigins = [
  env.CLIENT_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow dev origins gracefully
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Heartbeat & Status endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Agentra // Autonomous Operations Fabric Engine',
    version: '2.6.0',
    langGraph: require('./agents/orchestrator').getLangGraphStatus(),
    inMemoryDB: require('./config/db').isInMemory(),
    redisActive: require('./queues/executionQueue').isRedisActive()
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use(errorHandler);

// Seed default operator and initial workflow for instant demo experience
const seedDefaultData = async () => {
  try {
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Operator123!', salt);

    // 1. Seed operator@agentra.ai
    let agentraOp = await db.User.findOne({ email: 'operator@agentra.ai' });
    if (!agentraOp) {
      agentraOp = await db.User.create({
        name: 'Alex Rivera (Agentra Operator)',
        email: 'operator@agentra.ai',
        password: hashedPassword,
        role: 'operator',
        lastLogin: new Date()
      });
    }

    // 2. Seed operator@nexura.ai and operator@agentflow.ai (for backward compatibility)
    let altOp = await db.User.findOne({ email: 'operator@agentflow.ai' });
    if (!altOp) {
      altOp = await db.User.create({
        name: 'Alex Rivera (Demo Operator)',
        email: 'operator@agentflow.ai',
        password: hashedPassword,
        role: 'operator',
        lastLogin: new Date()
      });
    }

    const operatorId = agentraOp._id || altOp._id;
    console.log('\x1b[32m%s\x1b[0m', ' ⚡ Agentra Demo Operator initialized: operator@agentra.ai / Operator123!');

    // Seed sample workflow if none exist
    const count = await db.Workflow.countDocuments({ owner: operatorId });
    if (count === 0) {
      const sampleWorkflow = await db.Workflow.create({
        name: 'High-Priority Gmail & Slack Incident Dispatcher',
        description: 'Monitors incoming support inquiries, summarizes root causes using AI Reasoning Agent, records incident in Google Sheets, and alerts Slack war room.',
        owner: operatorId,
        status: 'active',
        tags: ['NEXURA AI', 'Gmail', 'Slack', 'Sheets', 'Incident Response'],
        triggerConfig: { type: 'gmail_trigger', schedule: '*/5 * * * *' },
        nodes: [
          {
            id: 'node_1',
            type: 'custom',
            position: { x: 100, y: 220 },
            data: {
              label: 'Gmail Incident Trigger',
              category: 'trigger',
              icon: 'Mail',
              provider: 'gmail',
              action: 'read_inbox',
              config: { query: 'label:urgent OR subject:Incident', maxResults: 5 }
            }
          },
          {
            id: 'node_2',
            type: 'custom',
            position: { x: 440, y: 220 },
            data: {
              label: 'Multi-Agent Root Cause Reasoner',
              category: 'ai_agent',
              icon: 'Sparkles',
              provider: 'ai',
              action: 'ai_process',
              config: {
                prompt: 'Analyze incident urgency, extract impacted subsystems, and formulate 2-sentence mitigation recommendation.',
                model: 'auto'
              }
            }
          },
          {
            id: 'node_3',
            type: 'custom',
            position: { x: 780, y: 140 },
            data: {
              label: 'Slack War Room Alert',
              category: 'integration',
              icon: 'MessageSquare',
              provider: 'slack',
              action: 'post_message',
              config: {
                channel: '#incident-room',
                message: '🚨 *INCIDENT DISPATCHED BY NEXURA AI AGENT*\nSummary: {{nodes.node_2.output.content}}'
              }
            }
          },
          {
            id: 'node_4',
            type: 'custom',
            position: { x: 780, y: 320 },
            data: {
              label: 'Google Sheets Audit Record',
              category: 'integration',
              icon: 'Table',
              provider: 'google-sheets',
              action: 'append_row',
              config: {
                spreadsheetId: '1Ops_Incident_Ledger_2026',
                range: 'Incidents!A:D',
                values: '{{nodes.node_1.output.timestamp}}, {{nodes.node_2.output.category}}, LOGGED'
              }
            }
          }
        ],
        edges: [
          { id: 'e1-2', source: 'node_1', target: 'node_2', animated: true },
          { id: 'e2-3', source: 'node_2', target: 'node_3', animated: true },
          { id: 'e2-4', source: 'node_2', target: 'node_4', animated: true }
        ],
        version: 1
      });

      console.log('\x1b[32m%s\x1b[0m', ` Seeded production workflow template: "${sampleWorkflow.name}"`);
    }
  } catch (err) {
    console.warn('Seeding initial data notice:', err.message);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();
  await seedDefaultData();

  server.listen(env.PORT, () => {
    console.log('\n\x1b[36m%s\x1b[0m', '==================================================');
    console.log('\x1b[32m%s\x1b[0m', ` 🚀 NEXURA // AI Neural Fabric Server on port ${env.PORT}`);
    console.log('\x1b[35m%s\x1b[0m', ` 📡 Socket.IO Real-Time Stream Ready`);
    console.log('\x1b[36m%s\x1b[0m', '==================================================\n');
  });
};

startServer();

module.exports = { app, server };
