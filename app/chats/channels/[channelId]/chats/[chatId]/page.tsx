"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useChatMessages } from "@/lib/hooks/useChatMessages";
import { useSocket } from "@/lib/hooks/useSocket";
import { Message } from "@/lib/types";
import { format, isToday, isYesterday, isThisYear } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  name: string;
  description: string | null;
  type: string;
}

export default function ChatPage() {
  const params = useParams();
  const [chat, setChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messageContent, setMessageContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false);
  
  const channelId = params?.channelId as string;
  const chatId = params?.chatId as string;
  
  // Получаем статус соединения сокета
  const { isConnected } = useSocket();
  
  // Используем хук для работы с сообщениями
  const { messages, isLoading: messagesLoading, error: messagesError, sendMessage } = useChatMessages({
    channelId,
    chatId,
  });

  // Обработка состояния соединения сокета
  useEffect(() => {
    if (!isConnected && !reconnecting) {
      setSocketError("Соединение с сервером потеряно. Попытка переподключения...");
      setReconnecting(true);
    } else if (isConnected && reconnecting) {
      setSocketError(null);
      setReconnecting(false);
    }
  }, [isConnected, reconnecting]);
  
  // Загрузка деталей чата
  useEffect(() => {
    const fetchChatDetails = async () => {
      if (!channelId || !chatId) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/channels/${channelId}/chats/${chatId}`);
        setChat(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке деталей чата:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChatDetails();
  }, [channelId, chatId]);
  
  // Скролл к последнему сообщению
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);
  
  // Отправка сообщения
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!messageContent.trim()) return;
    
    // Если соединение отсутствует, показываем ошибку
    if (!isConnected) {
      setSocketError("Нет соединения с сервером. Сообщение не может быть отправлено.");
      return;
    }
    
    // Сохраняем содержимое сообщения и очищаем поле ввода сразу
    const content = messageContent;
    setMessageContent('');
    
    try {
      // Отправляем сообщение, используя сохраненное содержимое
      await sendMessage(content);
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
    }
  };
  
  // Форматирование времени сообщения по новым правилам
  const formatMessageTime = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    
    // Для сообщений, отправленных сегодня - только время (часы и минуты)
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: ru });
    }
    
    // Для сообщений, отправленных вчера
    if (isYesterday(date)) {
      return `Вчера, ${format(date, 'HH:mm', { locale: ru })}`;
    }
    
    // Для остальных сообщений - дата в формате дд.мм.гг
    if (isThisYear(date)) {
      return format(date, 'dd.MM, HH:mm', { locale: ru });
    }
    
    // Если сообщение старше года
    return format(date, 'dd.MM.yyyy', { locale: ru });
  };
  
  // Попытка переподключения
  const handleRetryConnection = () => {
    window.location.reload();
  };
  
  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-zinc-400">Загрузка чата...</p>
      </div>
    );
  }
  
  if (!chat) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-zinc-400">Чат не найден</p>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col">
      <ChatStyles />
      {/* Шапка чата */}
      <div className="flex items-center h-14 border-b border-zinc-700 px-4">
        <div className="flex-1">
          <h2 className="text-md font-semibold text-white flex items-center">
            <span className="text-xs mr-2">#</span>
            {chat.name}
          </h2>
          {chat.description && (
            <p className="text-xs text-zinc-400">{chat.description}</p>
          )}
        </div>
        {/* Индикатор статуса соединения */}
        <div className="flex items-center">
          <div 
            className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
          ></div>
          <span className="text-xs text-zinc-400">
            {isConnected ? 'Онлайн' : 'Оффлайн'}
          </span>
        </div>
      </div>
      
      {/* Сообщение об ошибке сокета */}
      {socketError && (
        <div className="bg-red-900/30 p-2 text-center">
          <p className="text-xs text-red-300">{socketError}</p>
          <button 
            onClick={handleRetryConnection}
            className="text-xs underline text-red-300 mt-1 hover:text-red-200"
          >
            Попробовать снова
          </button>
        </div>
      )}
      
      {/* Сообщение об ошибке загрузки сообщений */}
      {messagesError && (
        <div className="bg-amber-900/30 p-2 text-center">
          <p className="text-xs text-amber-300">{messagesError}</p>
        </div>
      )}
      
      {/* Область сообщений с кастомным скроллбаром */}
      <div className="flex-1 overflow-hidden p-4 custom-scrollbar-container">
        <div className="h-full overflow-y-auto custom-scrollbar">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-zinc-400">Загрузка сообщений...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-zinc-400 text-center">
                Это начало чата #{chat.name}
              </p>
              <p className="text-zinc-500 text-sm text-center mt-1">
                Пока здесь нет сообщений. Будьте первым!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={cn(
                    "flex items-start transition-opacity",
                    message.isTemp && "opacity-70",
                    message.sendFailed && "opacity-50"
                  )}
                >
                  {message.user?.image ? (
                    <img 
                      src={message.user.image} 
                      alt={message.user.name || 'Пользователь'} 
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-700 mr-2 flex items-center justify-center">
                      <span className="text-xs text-white">
                        {message.user?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-white">
                        {message.user?.name}
                      </span>
                      <span className="ml-2 text-xs text-zinc-400 flex items-center">
                        {formatMessageTime(message.createdAt)}
                        {message.isTemp && (
                          <span className="ml-2 rounded-full w-2 h-2 bg-blue-400 animate-pulse"></span>
                        )}
                        {message.sendFailed && (
                          <span className="ml-2 text-red-400 text-xs">Ошибка отправки</span>
                        )}
                      </span>
                    </div>
                    <p className={cn(
                      "text-zinc-300 mt-1",
                      message.isTemp && "italic",
                      message.sendFailed && "text-red-300"
                    )}>
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>
      
      {/* Форма для отправки сообщений */}
      <form onSubmit={handleSendMessage} className="px-4 py-3 border-t border-zinc-700">
        <div className="w-full relative rounded-full bg-zinc-700 overflow-hidden">
          <input
            type="text"
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (messageContent.trim() && isConnected) {
                  // Сохраняем содержимое для отправки
                  const content = messageContent;
                  // Очищаем поле ввода сразу
                  setMessageContent('');
                  // Отправляем сообщение
                  sendMessage(content).catch(error => {
                    console.error("Ошибка при отправке сообщения:", error);
                  });
                }
              }
            }}
            placeholder={isConnected ? `Написать в #${chat.name}` : 'Соединение потеряно...'}
            disabled={!isConnected}
            className="w-full py-2 px-4 bg-transparent text-white focus:outline-none rounded-full disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!isConnected || !messageContent.trim()}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

// Добавляем стили для кастомного скроллбара
const ChatStyles = () => {
  return (
    <style jsx global>{`
      /* Контейнер с кастомным скроллбаром */
      .custom-scrollbar-container {
        position: relative;
        overflow: hidden;
      }
      
      /* Область скроллируемого контента */
      .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: rgba(161, 161, 170, 0.3) transparent;
        padding-right: 4px;
        height: 100%;
      }
      
      /* Стили для WebKit-based браузеров (Chrome, Safari, etc) */
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(24, 24, 27, 0.1);
        border-radius: 10px;
        margin: 2px;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: rgba(161, 161, 170, 0.3);
        border-radius: 10px;
        border: 2px solid transparent;
        background-clip: padding-box;
        transition: background-color 0.3s ease;
      }
      
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background-color: rgba(161, 161, 170, 0.5);
      }
      
      /* Скрытие скроллбара в состоянии покоя */
      .custom-scrollbar::-webkit-scrollbar-thumb {
        transition: background-color 0.3s ease;
        min-height: 50px;
      }
      
      /* Стили для Firefox */
      @supports (scrollbar-color: auto) {
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(161, 161, 170, 0.3) transparent;
        }
      }
    `}</style>
  );
};

export { ChatStyles };