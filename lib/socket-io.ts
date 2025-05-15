import { Server as IOServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import type { NextApiResponse } from 'next';

interface SocketServerOptions {
  httpServer: HTTPServer;
  path?: string;
}

interface ServerWithIO extends HTTPServer {
  io?: IOServer;
}

interface ResponseWithSocket extends NextApiResponse {
  socket: NetSocket & {
    server: ServerWithIO;
  };
}

// Синглтон для хранения экземпляра Socket.IO
let socketIOInstance: IOServer | null = null;

// Устанавливаем глобальную переменную для доступа к сокет-серверу из любой части приложения
declare global {
  var socketIOServer: IOServer | null;
}

// Инициализация при первой загрузке
if (!global.socketIOServer) {
  global.socketIOServer = null;
}

// Функция для установки экземпляра Socket.IO из server.js
export function setSocketIOInstance(io: IOServer): void {
  global.socketIOServer = io;
  socketIOInstance = io;
  console.log('Socket.IO instance set from server.js');
}

// Функция для инициализации сервера Socket.IO
export function getSocketIOServer(options: SocketServerOptions): IOServer {
  if (global.socketIOServer) {
    return global.socketIOServer;
  }

  const { httpServer, path = '/api/socket-io' } = options;
  const io = new IOServer(httpServer, {
    path,
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Настраиваем обработчики событий
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Присоединение к комнате чата
    socket.on('join-chat', (chatId: string) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat ${chatId}`);
    });
    
    // Покидание комнаты чата
    socket.on('leave-chat', (chatId: string) => {
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left chat ${chatId}`);
    });
    
    // Отправка сообщения
    socket.on('send-message', (message: any) => {
      console.log(`Message received from ${socket.id}:`, message);
      
      if (message.chatId) {
        console.log(`Broadcasting to chat ${message.chatId}`);
        io.to(message.chatId).emit('new-message', message);
      } else {
        console.warn('Message received without chatId:', message);
      }
    });
    
    // Отключение
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  // Сохраняем экземпляр в глобальной переменной
  global.socketIOServer = io;
  socketIOInstance = io;
  console.log('Socket.IO server initialized');
  
  return io;
}

// Функция для получения существующего экземпляра Socket.IO или создания нового
export function getSocketIO(res?: ResponseWithSocket): IOServer | null {
  if (global.socketIOServer) {
    return global.socketIOServer;
  }
  
  if (socketIOInstance) {
    return socketIOInstance;
  }
  
  if (res && res.socket && res.socket.server) {
    const server = res.socket.server as ServerWithIO;
    
    if (server.io) {
      global.socketIOServer = server.io;
      socketIOInstance = server.io;
      return server.io;
    }
    
    const io = getSocketIOServer({ httpServer: server });
    server.io = io;
    global.socketIOServer = io;
    socketIOInstance = io;
    return io;
  }
  
  return null;
}

// Функция для получения текущего экземпляра Socket.IO сервера
export function getIO(): IOServer | null {
  return global.socketIOServer || socketIOInstance;
} 