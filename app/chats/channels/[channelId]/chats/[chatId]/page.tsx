 "use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

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
  
  const channelId = params?.channelId as string;
  const chatId = params?.chatId as string;
  
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
      {/* Шапка чата */}
      <div className="flex items-center h-14 border-b border-zinc-700 px-4">
        <div>
          <h2 className="text-md font-semibold text-white flex items-center">
            <span className="text-xs mr-2">#</span>
            {chat.name}
          </h2>
          {chat.description && (
            <p className="text-xs text-zinc-400">{chat.description}</p>
          )}
        </div>
      </div>
      
      {/* Область сообщений */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-zinc-400 text-center">
            Это начало чата #{chat.name}
          </p>
          <p className="text-zinc-500 text-sm text-center mt-1">
            Пока здесь нет сообщений. Будьте первым!
          </p>
        </div>
      </div>
      
      {/* Форма для отправки сообщений */}
      <div className="px-4 py-3 border-t border-zinc-700">
        <div className="w-full relative rounded-full bg-zinc-700 overflow-hidden">
          <input
            type="text"
            placeholder={`Написать в #${chat.name}`}
            className="w-full py-2 px-4 bg-transparent text-white focus:outline-none rounded-full"
          />
          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white">
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
      </div>
    </div>
  );
}