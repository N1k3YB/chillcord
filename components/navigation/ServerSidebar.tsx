"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Settings, Users, LogOut } from "lucide-react";
import axios from "@/lib/axios";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  role: string;
}

interface Chat {
  id: string;
  name: string;
  description: string | null;
  type: string;
}

export const ServerSidebar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeChannelChats, setActiveChannelChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLeavingChannel, setIsLeavingChannel] = useState(false);
  const [blockedChannelIds, setBlockedChannelIds] = useState<Set<string>>(new Set());
  
  const activeChannelId = params?.channelId as string;
  const activeChatId = params?.chatId as string;
  
  // Функция для загрузки активного канала
  const fetchActiveChannel = async () => {
    if (!activeChannelId || blockedChannelIds.has(activeChannelId)) {
      setActiveChannel(null);
      return;
    }
    
    try {
      const response = await axios.get(`/api/channels/${activeChannelId}`);
      setActiveChannel(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке информации о канале:", error);
      setActiveChannel(null);
    }
  };
  
  // Загружаем информацию об активном канале
  useEffect(() => {
    const fetchActiveChannelEffect = async () => {
      if (!activeChannelId) {
        setActiveChannel(null);
        setIsLoading(false);
        return;
      }
      
      // Проверяем, не заблокирован ли этот канал
      if (blockedChannelIds.has(activeChannelId)) {
        console.log(`Канал ${activeChannelId} заблокирован после выхода, пропускаем запрос`);
        setActiveChannel(null);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/channels/${activeChannelId}`);
        setActiveChannel(response.data);
      } catch (error: any) {
        console.error("Ошибка при загрузке информации о канале:", error);
        setActiveChannel(null);
        
        // Если ошибка доступа (403) - значит пользователь не имеет доступа к каналу
        // или вышел из него - перенаправляем на главную страницу чатов
        if (error.response?.status === 403) {
          console.log("Пользователь не имеет доступа к каналу, перенаправление на главную");
          
          // Блокируем канал от дальнейших запросов
          setBlockedChannelIds(prev => new Set([...prev, activeChannelId]));
          
          // Перенаправляем на главную
          router.push("/chats");
          
          // Отправляем событие для обновления списка каналов в главном сайдбаре
          const event = new CustomEvent("channel-left", {
            detail: { channelId: activeChannelId }
          });
          window.dispatchEvent(event);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActiveChannelEffect();
  }, [activeChannelId, router, blockedChannelIds]);
  
  // Загружаем чаты для активного канала
  useEffect(() => {
    const fetchChannelChats = async () => {
      if (!activeChannelId || !activeChannel || blockedChannelIds.has(activeChannelId)) {
        setActiveChannelChats([]);
        return;
      }
      
      try {
        const response = await axios.get(`/api/channels/${activeChannelId}/chats`);
        setActiveChannelChats(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке чатов канала:", error);
        setActiveChannelChats([]);
      }
    };
    
    fetchChannelChats();
  }, [activeChannelId, activeChannel, blockedChannelIds]);
  
  const handleCreateChannel = () => {
    // Вызываем глобальное событие для открытия модального окна
    const event = new CustomEvent("open-create-channel-modal");
    window.dispatchEvent(event);
  };
  
  const handleCreateChat = (channelId: string) => {
    // Вызываем глобальное событие для открытия модального окна с ID канала
    const event = new CustomEvent("open-create-chat-modal", {
      detail: { channelId }
    });
    window.dispatchEvent(event);
  };
  
  // Обработчик выхода из канала
  const handleLeaveChannel = async () => {
    if (!activeChannel) return;
    
    try {
      setIsLeavingChannel(true);
      
      // Запрашиваем подтверждение от пользователя
      const confirmed = window.confirm(`Вы действительно хотите выйти из канала "${activeChannel.name}"?`);
      
      if (!confirmed) {
        setIsLeavingChannel(false);
        return;
      }
      
      // Сохраняем ID канала перед очисткой
      const channelIdToRemove = activeChannel.id;
      const channelNameToRemove = activeChannel.name;
      
      // Блокируем канал от дальнейших запросов
      setBlockedChannelIds(prev => new Set([...prev, channelIdToRemove]));
      
      // Немедленно очищаем состояние - это предотвратит дополнительные запросы
      setActiveChannel(null);
      setActiveChannelChats([]);
      
      try {
        // Отправляем запрос на выход из канала
        await axios.post(`/api/channels/${channelIdToRemove}/leave`);
        
        // Показываем сообщение об успехе
        toast.success(`Вы успешно вышли из канала "${channelNameToRemove}"`);
        
        // Отправляем событие для обновления списка каналов в главном сайдбаре
        const event = new CustomEvent("channel-left", {
          detail: { channelId: channelIdToRemove }
        });
        window.dispatchEvent(event);
        console.log("Событие выхода из канала отправлено:", channelIdToRemove);
        
        // Перенаправляем на главную страницу - делаем это после всех операций
        router.push("/chats");
      } catch (error: any) {
        console.error("Ошибка при выходе из канала:", error);
        
        // Показываем сообщение об ошибке
        toast.error(error.response?.data || "Ошибка при выходе из канала");
        
        // Восстанавливаем состояние, если была ошибка
        fetchActiveChannel();
      }
    } catch (error: any) {
      console.error("Ошибка при выходе из канала:", error);
      toast.error("Произошла ошибка при обработке выхода из канала");
    } finally {
      setIsLeavingChannel(false);
    }
  };
  
  // Содержимое для главной страницы (в будущем - друзья)
  const MainContent = () => (
    <div className="px-3">
      <div className="flex items-center justify-between h-12 mb-2">
        <h2 className="text-lg font-bold">Друзья</h2>
      </div>
      <div className="flex flex-col items-center justify-center py-8 px-2">
        <Users className="h-12 w-12 text-zinc-500 mb-2" />
        <div className="text-sm text-zinc-400 text-center mb-4">
          Здесь будет список ваших друзей.<br />
          Функция находится в разработке.
        </div>
      </div>
    </div>
  );
  
  // Содержимое для страницы канала
  const ChannelContent = () => (
    <div className="px-3">
      <div className="flex items-center justify-between h-12 mb-2">
        <h2 className="text-lg font-bold truncate" title={activeChannel?.name}>
          {activeChannel?.name}
        </h2>
        <div className="flex items-center gap-1">
          {activeChannel?.role === "ADMIN" && (
            <>
              <button
                onClick={() => router.push(`/chats/channels/${activeChannel.id}/settings`)}
                className="h-8 w-8 rounded-full hover:bg-zinc-500 flex items-center justify-center transition-colors"
                title="Настройки канала"
              >
                <Settings className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleCreateChat(activeChannel.id)}
                className="h-8 w-8 rounded-full hover:bg-zinc-500 flex items-center justify-center transition-colors"
                title="Создать чат"
              >
                <Plus className="h-4 w-4" />
              </button>
            </>
          )}
          <button
            onClick={handleLeaveChannel}
            disabled={isLeavingChannel}
            className="h-8 w-8 rounded-full hover:bg-red-600 flex items-center justify-center transition-colors"
            title="Выйти из канала"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Список чатов */}
      {activeChannelChats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 px-2">
          <div className="text-sm text-zinc-400 text-center">
            В этом канале пока нет чатов.
            {activeChannel?.role === "ADMIN" && " Создайте новый чат, чтобы начать общение."}
          </div>
          {activeChannel?.role === "ADMIN" && (
            <button
              onClick={() => handleCreateChat(activeChannel.id)}
              className="mt-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium text-white transition-colors"
            >
              Создать чат
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-1 animate-slide-up">
          {activeChannelChats.map((chat) => (
            <Link
              key={chat.id}
              href={`/chats/channels/${activeChannelId}/chats/${chat.id}`}
              className={cn(
                "flex items-center gap-2 py-2 px-3 rounded-full text-sm transition-colors",
                activeChatId === chat.id ? "bg-zinc-600 text-white" : "text-zinc-300 hover:bg-zinc-600/30 hover:text-white"
              )}
            >
              {chat.type === "TEXT" ? (
                <span className="text-xs">#</span>
              ) : (
                <span className="text-xs">📢</span>
              )}
              <span className="truncate">{chat.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
  
  // Если загружается - показываем заглушку
  if (isLoading) {
    return (
      <div className="h-full w-60 z-20 flex flex-col bg-zinc-700 py-3 text-zinc-200">
        <div className="px-3">
          <div className="h-6 w-32 bg-zinc-600 rounded animate-pulse mb-4" />
          <div className="space-y-3 mt-6">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-zinc-600 rounded-full animate-pulse" />
              <div className="h-4 w-40 bg-zinc-600 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-zinc-600 rounded-full animate-pulse" />
              <div className="h-4 w-36 bg-zinc-600 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-zinc-600 rounded-full animate-pulse" />
              <div className="h-4 w-44 bg-zinc-600 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full w-60 z-20 flex flex-col bg-zinc-700 py-3 text-zinc-200">
      {activeChannelId ? <ChannelContent /> : <MainContent />}
    </div>
  );
}; 