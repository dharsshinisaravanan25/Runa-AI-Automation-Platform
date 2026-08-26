const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer, clientUrl) => {
  io = new Server(httpServer, {
    cors: {
      origin: [clientUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    // Join execution room for live streaming
    socket.on('join:execution', (executionId) => {
      if (executionId) {
        socket.join(`execution:${executionId}`);
      }
    });

    socket.on('leave:execution', (executionId) => {
      if (executionId) {
        socket.leave(`execution:${executionId}`);
      }
    });

    // Join user notification room
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

// Real-time broadcast helpers
const emitAgentEvent = (executionId, eventData) => {
  if (io && executionId) {
    io.to(`execution:${executionId}`).emit('agent:event', eventData);
  }
};

const emitExecutionUpdate = (executionId, execution) => {
  if (io && executionId) {
    io.to(`execution:${executionId}`).emit('execution:update', execution);
    io.emit('executions:list_update', execution);
  }
};

const emitNotification = (userId, notification) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit('notification:new', notification);
    io.emit('notification:broadcast', notification);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitAgentEvent,
  emitExecutionUpdate,
  emitNotification
};
