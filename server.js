const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

// Импортируем функцию для сохранения экземпляра
const path = require('path');
const socketIoPath = path.join(process.cwd(), 'lib', 'socket-io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Инициализируем Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Подготавливаем Next.js и запускаем сервер
app.prepare().then(() => {
  // Создаем HTTP сервер
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Инициализируем Socket.IO на том же сервере с улучшенными настройками
  const io = new Server(server, {
    path: '/socket.io',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    connectTimeout: 20000, // Увеличиваем таймаут соединения до 20 секунд
    pingTimeout: 30000,    // Таймаут для пингов
    pingInterval: 10000,   // Интервал пингов
    transports: ['websocket', 'polling'], // Поддерживать оба транспорта
    allowUpgrades: true,   // Разрешить повышение соединения
    maxHttpBufferSize: 1e6, // Увеличение размера буфера для сообщений
  });

  // Сохраняем экземпляр в глобальном объекте для доступа из API
  global.socketIOServer = io;
  
  // Для совместимости с ESM
  try {
    const socketIo = require(socketIoPath);
    if (typeof socketIo.setSocketIOInstance === 'function') {
      socketIo.setSocketIOInstance(io);
    }
  } catch (err) {
    console.warn('Не удалось импортировать socket-io модуль:', err.message);
  }

  // Настраиваем обработчики Socket.IO
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Проверка доступности сокета каждые 30 секунд
    const heartbeat = setInterval(() => {
      socket.emit('ping');
    }, 30000);
    
    // Идентификация пользователя
    socket.on('identify', ({ userId }) => {
      if (userId) {
        // Сохраняем ID пользователя в данных сокета
        socket.data.userId = userId;
        console.log(`Socket ${socket.id} identified as user ${userId}`);
      }
    });
    
    // Присоединение к комнате чата
    socket.on('join-chat', (chatId) => {
      try {
        socket.join(chatId);
        console.log(`Socket ${socket.id} joined chat ${chatId}`);
        
        // Отправляем подтверждение присоединения
        socket.emit('joined-chat', { chatId });
        
        // Если у сокета есть userId, оповещаем всех в чате о новом пользователе
        if (socket.data.userId) {
          // Отправляем событие всем в чате, кроме текущего пользователя
          socket.to(chatId).emit('user-joined', { 
            chatId, 
            userId: socket.data.userId 
          });
        }
      } catch (error) {
        console.error(`Error joining chat ${chatId}:`, error);
        socket.emit('error', { message: 'Не удалось присоединиться к чату' });
      }
    });
    
    // Покидание комнаты чата
    socket.on('leave-chat', (chatId) => {
      try {
        socket.leave(chatId);
        console.log(`Socket ${socket.id} left chat ${chatId}`);
        
        // Если у сокета есть userId, оповещаем всех в чате о выходе пользователя
        if (socket.data.userId) {
          socket.to(chatId).emit('user-left', { 
            chatId, 
            userId: socket.data.userId 
          });
        }
      } catch (error) {
        console.error(`Error leaving chat ${chatId}:`, error);
      }
    });
    
    // Отправка сообщения
    socket.on('send-message', (message) => {
      console.log(`Message received from ${socket.id}:`, message);
      
      try {
        if (message && message.chatId) {
          console.log(`Broadcasting to chat ${message.chatId}`);
          io.to(message.chatId).emit('new-message', message);
        } else {
          console.warn('Message received without chatId:', message);
          socket.emit('error', { message: 'Сообщение должно содержать chatId' });
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Ошибка при отправке сообщения' });
      }
    });
    
    // Явное подтверждение при получении клиентом
    socket.on('message-received', (messageId) => {
      console.log(`Message ${messageId} received by client ${socket.id}`);
    });
    
    // Обработка ошибок сокета
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
    
    // Отключение
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
      clearInterval(heartbeat);
    });
  });

  // Запускаем сервер
  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server integrated on the same port`);
  });
}); 