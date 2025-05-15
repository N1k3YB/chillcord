import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

// Интерфейс для работы с сокетом
interface SocketHookReturn {
  socket: Socket | null;
  isConnected: boolean;
}

// Хук для работы с сокетом
export const useSocket = (): SocketHookReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const { data: session } = useSession();
  // Безопасно получаем userId из сессии
  const userId = (session?.user as any)?.id;

  useEffect(() => {
    // Теперь сокет на том же порту, что и Next.js приложение
    const socketUrl = window.location.origin;
    console.log(`Подключение к сокет-серверу: ${socketUrl}`);
    
    // Инициализируем сокет, настроенный на тот же домен
    const socketInstance = io(socketUrl, {
      path: '/socket.io',
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000, // Увеличиваем таймаут до 20 секунд
      autoConnect: true,
      transports: ['websocket', 'polling'], // Сначала WebSocket, затем fallback на polling
      forceNew: true, // Создавать новое соединение
      upgrade: true, // Разрешаем повышение с polling до websocket
    });

    // Обработчики событий
    socketInstance.on('connect', () => {
      console.log(`Socket connected with ID: ${socketInstance.id}`);
      setIsConnected(true);
      
      // Если есть идентификатор пользователя, отправляем его серверу
      if (userId) {
        console.log(`Identifying socket as user ${userId}`);
        socketInstance.emit('identify', { userId });
      }
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      // Пробуем переключиться на polling при ошибке WebSocket
      if (socketInstance.io && socketInstance.io.opts && socketInstance.io.opts.transports && 
          socketInstance.io.opts.transports[0] === 'websocket') {
        console.log('Переключение на polling транспорт...');
        // Безопасное переключение на polling
        try {
          // Используем метод io.engine для переключения транспорта
          socketInstance.disconnect();
          // Повторно подключаемся, но сначала с polling
          setTimeout(() => {
            socketInstance.connect();
          }, 1000);
        } catch (e) {
          console.error('Ошибка при смене транспорта:', e);
        }
      }
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      setIsConnected(false);
      
      // Если сервер закрыл соединение, пробуем восстановить
      if (reason === 'io server disconnect' || reason === 'transport close') {
        console.log('Пробуем восстановить соединение...');
        socketInstance.connect();
      }
    });

    socketInstance.io.on('reconnect', (attempt) => {
      console.log(`Socket reconnected after ${attempt} attempts`);
    });

    socketInstance.io.on('reconnect_attempt', (attempt) => {
      console.log(`Socket reconnection attempt ${attempt}`);
    });

    socketInstance.io.on('reconnect_error', (err) => {
      console.error('Socket reconnection error:', err);
    });

    socketInstance.io.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
    });

    // Установка сокета
    setSocket(socketInstance);

    // Очистка при размонтировании
    return () => {
      console.log('Closing socket connection');
      socketInstance.disconnect();
    };
  }, [userId]); // Добавляем userId в зависимости

  return { socket, isConnected };
}; 