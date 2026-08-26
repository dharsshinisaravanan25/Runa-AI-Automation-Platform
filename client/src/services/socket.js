import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket && typeof window !== 'undefined') {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    socket.on('connect', () => {
      // Re-join user room on reconnection if logged in
      const userStr = localStorage.getItem('agentflow_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (user.id) {
            socket.emit('join:user', user.id);
          }
        } catch (e) {}
      }
    });
  }
  return socket;
};

export const joinExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s && executionId) {
    s.emit('join:execution', executionId);
  }
};

export const leaveExecutionRoom = (executionId) => {
  const s = getSocket();
  if (s && executionId) {
    s.emit('leave:execution', executionId);
  }
};
