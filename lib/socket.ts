import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIO } from '@/lib/types';

export const config = {
  api: {
    bodyParser: false,
  },
};

// Экспортируем функцию для инициализации Socket.IO сервера
export const initSocketServer = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });
    
    // Обработка событий сокета
    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      
      // Подключение к комнате чата
      socket.on('join-chat', (chatId: string) => {
        socket.join(chatId);
        console.log(`Socket ${socket.id} joined chat ${chatId}`);
      });
      
      // Отключение от комнаты чата
      socket.on('leave-chat', (chatId: string) => {
        socket.leave(chatId);
        console.log(`Socket ${socket.id} left chat ${chatId}`);
      });
      
      // Отправка сообщения в чат
      socket.on('send-message', (message: any) => {
        if (message.chatId) {
          io.to(message.chatId).emit('new-message', message);
        }
      });
      
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
    
    res.socket.server.io = io;
  }
  
  return res.socket.server.io;
}; 