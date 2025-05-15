import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import { Message } from '@/lib/types';
import { useSocket } from './useSocket';
import { useSession } from 'next-auth/react';

interface UseChatMessagesProps {
  channelId: string;
  chatId: string;
}

interface UseChatMessagesReturn {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
}

export const useChatMessages = ({ channelId, chatId }: UseChatMessagesProps): UseChatMessagesReturn => {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const receivedMessages = useRef<Set<string>>(new Set());
  const { data: session } = useSession();
  // Безопасно извлекаем ID пользователя из сессии
  const currentUserId = (session?.user as any)?.id;
  const currentChatRef = useRef<string | null>(null);
  
  // Обновление списка сообщений с новым сообщением
  const updateMessages = useCallback((newMessage: Message) => {
    console.log('Обновление сообщений с:', newMessage.id, 'содержимое:', newMessage.content);
    
    setMessages((prevMessages) => {
      // Проверяем, есть ли уже сообщение с таким ID
      const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
      
      if (messageExists) {
        console.log('Сообщение уже существует в списке:', newMessage.id);
        return prevMessages;
      }
      
      console.log('Добавляем новое сообщение в список:', newMessage.id);
      
      // Добавляем ID в Set полученных сообщений
      receivedMessages.current.add(newMessage.id);
      
      // Сортируем сообщения по дате
      const updatedMessages = [...prevMessages, newMessage].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      
      return updatedMessages;
    });
  }, []);

  // Загрузка сообщений
  const fetchMessages = useCallback(async () => {
    if (!channelId || !chatId) return;

    try {
      setIsLoading(true);
      const response = await axios.get(`/api/channels/${channelId}/chats/${chatId}/messages`);
      
      // Очищаем список ранее полученных сообщений при новой загрузке
      receivedMessages.current.clear();
      
      // Сохраняем IDs загруженных сообщений
      response.data.forEach((msg: Message) => {
        receivedMessages.current.add(msg.id);
      });
      
      setMessages(response.data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      setError('Не удалось загрузить сообщения');
    } finally {
      setIsLoading(false);
    }
  }, [channelId, chatId]);

  // Отправка сообщения с оптимистичным обновлением
  const sendMessage = async (content: string) => {
    if (!channelId || !chatId || !content.trim()) return;

    // Временный ID для отслеживания (не используем в DOM)
    const tempClientId = Date.now().toString();
    
    // Создаем временное сообщение для оптимистичного UI
    const tempMessage: Message = {
      id: tempClientId,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: currentUserId || '',
      chatId,
      user: {
        id: currentUserId || '',
        name: session?.user?.name || 'Вы',
        image: session?.user?.image || null
      },
      isTemp: true
    };
    
    // Добавляем временное сообщение в UI
    updateMessages(tempMessage);
    
    try {
      // Отправляем реальный запрос
      const response = await axios.post(`/api/channels/${channelId}/chats/${chatId}/messages`, {
        content,
      });

      // Получаем реальное сообщение с сервера
      const serverMessage = response.data;
      
      // Добавляем ID реального сообщения в список полученных
      // чтобы не дублировать его при получении через сокет
      receivedMessages.current.add(serverMessage.id);
      
      // Заменяем временное сообщение на реальное
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempClientId ? serverMessage : msg
        )
      );

      // Отправляем через сокет для других клиентов
      if (socket && isConnected) {
        socket.emit('send-message', {
          ...serverMessage,
          chatId,
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Не удалось отправить сообщение');
      
      // Помечаем сообщение как не отправленное
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === tempClientId 
            ? { ...msg, sendFailed: true } 
            : msg
        )
      );
    }
  };

  // Функция для безопасного подключения к чату
  const joinChat = useCallback((socket: Socket, newChatId: string) => {
    if (!socket || !isConnected || !newChatId) return;
    
    console.log(`Подключение к чату ${newChatId}`);
    
    // Сначала выходим из предыдущего чата
    const prevChatId = currentChatRef.current;
    if (prevChatId && prevChatId !== newChatId) {
      console.log(`Выход из предыдущего чата ${prevChatId}`);
      socket.emit('leave-chat', prevChatId);
    }
    
    // Затем присоединяемся к новому чату
    socket.emit('join-chat', newChatId);
    
    // Обновляем ссылку на текущий чат
    currentChatRef.current = newChatId;
  }, [isConnected]);

  // Подключение к сокету
  useEffect(() => {
    if (!socket || !isConnected || !chatId) return;
    
    // Подключаемся к новому чату
    joinChat(socket, chatId);
    
    // Слушаем подтверждение присоединения
    const handleJoinedChat = (data: { chatId: string }) => {
      console.log(`Подтверждено подключение к чату ${data.chatId}`);
    };

    // Обработчик новых сообщений
    const handleNewMessage = (message: Message) => {
      console.log('Получено новое сообщение по сокету:', message);
      
      if (message.chatId === chatId) {
        // Отправляем подтверждение о получении
        socket.emit('message-received', message.id);
        
        // Если это сообщение от текущего пользователя и уже есть в списке, пропускаем
        if (message.userId === currentUserId && 
            receivedMessages.current.has(message.id)) {
          console.log('Пропускаем дубликат собственного сообщения:', message.id);
          return;
        }
        
        // Обновляем список сообщений
        updateMessages(message);
      }
    };
    
    // Обработчик входа пользователя в чат
    const handleUserJoined = (data: { chatId: string, userId: string }) => {
      if (data.chatId === chatId) {
        console.log(`Пользователь ${data.userId} присоединился к чату ${data.chatId}`);
        // Создаем и отправляем пользовательское событие
        const userJoinedEvent = new CustomEvent("user-joined-chat", { 
          detail: { chatId: data.chatId, userId: data.userId } 
        });
        window.dispatchEvent(userJoinedEvent);
      }
    };
    
    // Обработчик выхода пользователя из чата
    const handleUserLeft = (data: { chatId: string, userId: string }) => {
      if (data.chatId === chatId) {
        console.log(`Пользователь ${data.userId} покинул чат ${data.chatId}`);
        // Создаем и отправляем пользовательское событие
        const userLeftEvent = new CustomEvent("user-left-chat", { 
          detail: { chatId: data.chatId, userId: data.userId } 
        });
        window.dispatchEvent(userLeftEvent);
      }
    };
    
    // Обработчик ошибок от сервера
    const handleError = (error: any) => {
      console.error('Ошибка сокета:', error);
      setError(error.message || 'Произошла ошибка соединения');
    };
    
    // Обработчик пингов от сервера
    const handlePing = () => {
      // Отвечаем на пинг для поддержания соединения
      socket.emit('pong');
    };

    // Подписываемся на события
    socket.on('joined-chat', handleJoinedChat);
    socket.on('new-message', handleNewMessage);
    socket.on('user-joined', handleUserJoined);
    socket.on('user-left', handleUserLeft);
    socket.on('error', handleError);
    socket.on('ping', handlePing);

    // Отписываемся при размонтировании или изменении зависимостей
    return () => {
      socket.off('joined-chat', handleJoinedChat);
      socket.off('new-message', handleNewMessage);
      socket.off('user-joined', handleUserJoined);
      socket.off('user-left', handleUserLeft);
      socket.off('error', handleError);
      socket.off('ping', handlePing);
      
      // Покидаем чат при выходе или переключении на другой чат
      if (currentChatRef.current) {
        console.log(`Отключение от чата ${currentChatRef.current}`);
        socket.emit('leave-chat', currentChatRef.current);
        currentChatRef.current = null;
      }
    };
  }, [socket, isConnected, chatId, updateMessages, currentUserId, joinChat]);

  // Загрузка сообщений при монтировании
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return { messages, isLoading, error, sendMessage };
}; 