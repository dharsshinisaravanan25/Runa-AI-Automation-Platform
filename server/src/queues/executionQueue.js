const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');
const env = require('../config/env');
const orchestrator = require('../agents/orchestrator');

let bullQueue = null;
let bullWorker = null;
let isRedisActive = false;

// In-Memory Fallback Queue
class InMemoryExecutionQueue {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
  }

  async add(name, data, opts = {}) {
    const job = {
      id: 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name,
      data,
      opts,
      createdAt: Date.now()
    };

    if (opts.delay && opts.delay > 0) {
      setTimeout(() => {
        this.queue.push(job);
        this.processNext();
      }, opts.delay);
    } else {
      this.queue.push(job);
      setImmediate(() => this.processNext());
    }

    return job;
  }

  async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const job = this.queue.shift();
    try {
      if (job && job.data && job.data.executionId) {
        await orchestrator.runWorkflow(job.data.executionId);
      }
    } catch (err) {
      console.error(`InMemoryQueue: Error processing job ${job?.id}:`, err.message);
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        setImmediate(() => this.processNext());
      }
    }
  }
}

const inMemoryQueue = new InMemoryExecutionQueue();

// Initialize BullMQ if REDIS_URL is provided
const initQueue = () => {
  if (env.REDIS_URL) {
    try {
      const connection = new IORedis(env.REDIS_URL, {
        maxRetriesPerRequest: null,
        connectTimeout: 3000
      });

      connection.on('connect', () => {
        console.log('\x1b[32m%s\x1b[0m', ' Connected to Redis for BullMQ Execution Queue');
        isRedisActive = true;
      });

      connection.on('error', (err) => {
        console.warn('\x1b[33m%s\x1b[0m', ` Redis connection failed: ${err.message}. Using In-Memory queue fallback.`);
        isRedisActive = false;
      });

      bullQueue = new Queue('agentflow-execution-queue', { connection });
      bullWorker = new Worker('agentflow-execution-queue', async (job) => {
        const { executionId } = job.data;
        await orchestrator.runWorkflow(executionId);
      }, { connection, concurrency: 5 });

    } catch (err) {
      console.warn('BullMQ init error, falling back to In-Memory queue:', err.message);
      isRedisActive = false;
    }
  } else {
    console.log('\x1b[36m%s\x1b[0m', 'ℹ️ No REDIS_URL provided. Operating with In-Memory Execution Queue.');
    isRedisActive = false;
  }
};

initQueue();

const addExecutionJob = async (executionId, options = {}) => {
  if (isRedisActive && bullQueue) {
    try {
      return await bullQueue.add('run-workflow', { executionId }, options);
    } catch (err) {
      console.warn('BullMQ add failed, routing to in-memory queue:', err.message);
    }
  }
  return await inMemoryQueue.add('run-workflow', { executionId }, options);
};

module.exports = {
  addExecutionJob,
  isRedisActive: () => isRedisActive
};
