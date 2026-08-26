const mongoose = require('mongoose');
const env = require('./env');

let isInMemory = false;
let memoryStore = {
  users: [],
  workflows: [],
  executions: [],
  executionlogs: [],
  integrations: [],
  notifications: [],
  agentmemories: []
};

const connectDB = async () => {
  if (env.MONGODB_URI) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 3000
      });
      console.log('\x1b[32m%s\x1b[0m', ' Connected to MongoDB Database');
      return { inMemory: false };
    } catch (err) {
      console.warn('\x1b[33m%s\x1b[0m', ` MongoDB connection failed: ${err.message}. Falling back to high-fidelity in-memory store.`);
    }
  } else {
    console.log('\x1b[36m%s\x1b[0m', 'ℹ️ No MONGODB_URI provided. Initializing fast in-memory document store.');
  }

  isInMemory = true;
  return { inMemory: true, store: memoryStore };
};

module.exports = {
  connectDB,
  isInMemory: () => isInMemory,
  getMemoryStore: () => memoryStore
};
