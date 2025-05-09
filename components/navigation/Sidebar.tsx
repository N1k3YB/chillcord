"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { LogOut, Settings, User, ChevronRight, Hash, Plus, Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import axios from "@/lib/axios";
import { useTheme } from "@/app/context/ThemeContext";
import { useLastRouteStore } from "@/lib/stores/last-route-store";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  role: string;
}

export const Sidebar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const { fontSize } = useTheme();
  const { lastChatRoute } = useLastRouteStore();
  const [expanded, setExpanded] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Channel[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [blockedChannelIds, setBlockedChannelIds] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const activeChannelId = params?.channelId as string;

  const fetchChannels = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/channels");
      setChannels(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке каналов:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
    
    // Прослушиваем событие создания нового канала
    const handleChannelCreated = (event: CustomEvent<Channel>) => {
      setChannels(prev => [...prev, event.detail]);
    };
    
    // Прослушиваем событие выхода из канала
    const handleChannelLeft = (event: CustomEvent<{ channelId: string }>) => {
      console.log("Пользователь вышел из канала:", event.detail.channelId);
      
      // Добавляем канал в список заблокированных
      setBlockedChannelIds(prev => new Set([...prev, event.detail.channelId]));
      
      // Немедленно удаляем канал из списка, независимо от результата запроса
      setChannels(prev => prev.filter(channel => channel.id !== event.detail.channelId));
      
      // Принудительно обновляем список каналов для синхронизации
      // Используем setTimeout, чтобы избежать конфликтов
      setTimeout(() => {
        fetchChannels();
      }, 300);
    };
    
    // Прослушиваем событие удаления канала
    const handleChannelDeleted = (event: CustomEvent<{ channelId: string }>) => {
      console.log("Канал был удален:", event.detail.channelId);
      
      // Добавляем канал в список заблокированных
      setBlockedChannelIds(prev => new Set([...prev, event.detail.channelId]));
      
      // Немедленно удаляем канал из списка
      setChannels(prev => prev.filter(channel => channel.id !== event.detail.channelId));
      
      // Переадресуем на главную страницу, если мы находимся в этом канале
      const currentPath = window.location.pathname;
      if (currentPath.includes(`/chats/channels/${event.detail.channelId}`)) {
        router.push("/chats");
      }
    };
    
    window.addEventListener("channel-created" as any, handleChannelCreated);
    window.addEventListener("channel-left" as any, handleChannelLeft);
    window.addEventListener("channel-deleted" as any, handleChannelDeleted);
    
    return () => {
      window.removeEventListener("channel-created" as any, handleChannelCreated);
      window.removeEventListener("channel-left" as any, handleChannelLeft);
      window.removeEventListener("channel-deleted" as any, handleChannelDeleted);
    };
  }, []);
  
  // Проверяем параметры URL при монтировании компонента
  useEffect(() => {
    // Если в URL есть ID канала, проверяем, заблокирован ли он
    if (activeChannelId && blockedChannelIds.has(activeChannelId)) {
      console.log(`Обнаружен заблокированный канал в URL: ${activeChannelId}, перенаправляем`);
      router.push('/chats');
    }
  }, [activeChannelId, blockedChannelIds, router]);

  // Функция для поиска публичных каналов
  const searchPublicChannels = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await axios.get(`/api/channels/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Ошибка при поиске каналов:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Функция для присоединения к каналу
  const joinChannel = async (channelId: string) => {
    try {
      await axios.post(`/api/channels/${channelId}/join`);
      
      // После успешного присоединения обновляем список каналов
      fetchChannels();
      
      // Закрываем поиск
      setSearchOpen(false);
      setSearchQuery("");
      
      // Переходим в канал
      router.push(`/chats/channels/${channelId}`);
    } catch (error) {
      console.error("Ошибка при присоединении к каналу:", error);
    }
  };

  useEffect(() => {
    // Добавляем таймаут для поиска, чтобы не отправлять запрос при каждом нажатии клавиши
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchPublicChannels(searchQuery);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleProfileClick = () => {
    router.push("/profile");
  };
  
  const handleSettingsClick = () => {
    router.push("/profile/settings");
  };

  const joinDate = new Date().toLocaleDateString('ru-RU', { 
    year: 'numeric', 
    month: 'short',
    day: 'numeric'
  });

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const handleCreateChannel = () => {
    const event = new CustomEvent("open-create-channel-modal");
    window.dispatchEvent(event);
  };

  // Функция для генерации аватара канала на основе имени
  const getChannelInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  // Функция для навигации к каналу
  const navigateToChannel = (channelId: string) => {
    // Проверяем, не заблокирован ли канал
    if (blockedChannelIds.has(channelId)) {
      console.log(`Канал ${channelId} был заблокирован, пропускаем навигацию`);
      return;
    }
    
    router.push(`/chats/channels/${channelId}`);
  };

  // Функция навигации к главной странице
  const navigateToMain = () => {
    // Обновляем список каналов для синхронизации
    fetchChannels();
    // Перенаправляем на главную страницу чатов
    router.push("/chats");
  };

  // Обработчик открытия поиска
  const openSearch = () => {
    setSearchOpen(true);
    // Фокусируемся на инпуте поиска после его отображения
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  // Обработчик закрытия поиска
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div 
      className={cn(
        "h-full z-30 flex flex-col items-center py-3 bg-zinc-800 border-r border-zinc-700 transition-all duration-300 ease-in-out",
        expanded ? "w-60" : fontSize === "14px" ? "w-[72px]" : fontSize === "16px" ? "w-[80px]" : "w-[92px]"
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="w-full flex flex-col items-center overflow-y-auto overflow-x-hidden">
        {/* Логотип и toggle */}
        <div className="flex items-center justify-between w-full px-3 mb-4">
          <div
            className={cn(
              "flex items-center cursor-pointer transition-all duration-300",
              expanded ? 
                "h-12 w-full bg-zinc-700 hover:bg-zinc-600 rounded-full px-3 gap-3" : 
                "h-12 w-12 mx-auto justify-center rounded-full",
              (activeChannelId === undefined || activeChannelId === null) && (expanded ? "bg-indigo-500 hover:bg-indigo-600" : "bg-indigo-500")
            )}
            onClick={navigateToMain}
            title="Главная"
          >
            <div className={cn(
              "flex items-center justify-center transition-all duration-300",
              expanded ? "h-8 w-8 rounded-full flex-shrink-0" : "h-full w-full rounded-full"
            )}>
              <span className="text-white text-xl font-bold">CC</span>
            </div>
            
            <div 
              className={cn(
                "flex flex-col min-w-0 overflow-hidden transition-all duration-700 ease-in-out", 
                expanded ? "opacity-100 w-full" : "opacity-0 w-0"
              )}
            >
              <p className="font-medium text-white truncate whitespace-nowrap">
                Главная
              </p>
            </div>
          </div>
          
          {expanded && (
            <button 
              onClick={toggleSidebar} 
              className="text-zinc-400 hover:text-white absolute right-3"
            >
              <ChevronRight className="h-5 w-5 transition-transform" />
            </button>
          )}
        </div>

        {/* Поиск каналов */}
        <div className="w-full px-3 mb-4 relative">
          <div
            className={cn(
              "flex items-center cursor-pointer transition-all duration-300",
              expanded ? 
                "h-12 w-full bg-zinc-700 hover:bg-zinc-600 rounded-full px-3 gap-3" : 
                "h-12 w-12 mx-auto justify-center rounded-full"
            )}
            onClick={openSearch}
            title="Найти каналы"
          >
            <div className={cn(
              "flex items-center justify-center transition-all duration-300",
              expanded ? "h-8 w-8 rounded-full flex-shrink-0" : "h-full w-full rounded-full"
            )}>
              <Search className="h-5 w-5 text-indigo-400" />
            </div>
            
            <div 
              className={cn(
                "flex flex-col min-w-0 overflow-hidden transition-all duration-700 ease-in-out", 
                expanded ? "opacity-100 w-full" : "opacity-0 w-0"
              )}
            >
              <p className="font-medium text-white truncate whitespace-nowrap">
                Найти каналы
              </p>
            </div>
          </div>
        </div>

        {/* Разделитель */}
        <div className="h-[2px] w-10 bg-zinc-700 rounded-full mb-4" />

        {/* Список каналов */}
        <div className="w-full px-3 flex-1 overflow-hidden">
          <div className="overflow-y-auto overflow-x-hidden pr-1 max-h-[calc(100vh-150px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-2">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse" />
                  <div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse" />
                  <div className="w-10 h-10 rounded-full bg-zinc-700 animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                {channels.map((channel) => (
                  <div 
                    key={channel.id} 
                    className="relative mb-3"
                  >
                    <div
                      className={cn(
                        "flex items-center cursor-pointer transition-all duration-300",
                        expanded ? 
                          "h-12 w-full bg-zinc-700 hover:bg-zinc-600 rounded-full px-3 gap-3" : 
                          "h-12 w-12 mx-auto justify-center rounded-full",
                        activeChannelId === channel.id && (expanded ? "bg-indigo-500 hover:bg-indigo-600" : "bg-indigo-500")
                      )}
                      onClick={() => navigateToChannel(channel.id)}
                    >
                      <div className={cn(
                        "flex items-center justify-center transition-all duration-300",
                        expanded ? "h-8 w-8 rounded-full flex-shrink-0" : "h-full w-full rounded-full"
                      )}>
                        <span className="text-white text-xs font-semibold" style={{ fontSize: '10px', lineHeight: '1' }}>
                          {getChannelInitials(channel.name)}
                        </span>
                      </div>
                      
                      <div 
                        className={cn(
                          "flex flex-col min-w-0 overflow-hidden transition-all duration-700 ease-in-out", 
                          expanded ? "opacity-100 w-full" : "opacity-0 w-0"
                        )}
                      >
                        <p className="font-medium text-white truncate">
                          {channel.name}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div 
                  className={cn(
                    "flex items-center cursor-pointer transition-all duration-300",
                    expanded ? 
                      "h-12 w-full bg-zinc-700 hover:bg-zinc-600 rounded-full px-3 gap-3 mt-2" : 
                      "h-12 w-12 mx-auto justify-center rounded-full mt-2"
                  )}
                  onClick={handleCreateChannel}
                  title="Создать канал"
                >
                  <div className={cn(
                    "flex items-center justify-center transition-all duration-300",
                    expanded ? "h-8 w-8 rounded-full flex-shrink-0" : "h-full w-full rounded-full"
                  )}>
                    <Plus className="h-5 w-5 text-green-500" />
                  </div>
                  
                  <div 
                    className={cn(
                      "flex flex-col min-w-0 overflow-hidden transition-all duration-700 ease-in-out", 
                      expanded ? "opacity-100 w-full" : "opacity-0 w-0"
                    )}
                  >
                    <p className="font-medium text-white truncate whitespace-nowrap">
                      Создать канал
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Мини-профиль внизу */}
      <div className="mt-auto w-full px-3">
        <div 
          className={cn(
            "flex items-center cursor-pointer transition-all duration-700",
            expanded ? 
              "w-full bg-zinc-800 hover:bg-zinc-750 border-zinc-700 rounded-full px-3 gap-3 p-2" : 
              "mx-auto justify-center p-0 pt-0"
          )}
        >
          <div className={cn(
            "flex items-center justify-center transition-all duration-300",
            expanded ? "h-10 w-10 rounded-full flex-shrink-0" : "h-12 w-12 rounded-full"
          )}>
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="Avatar"
                width={expanded ? 40 : 48}
                height={expanded ? 40 : 48}
                className="rounded-full"
                onClick={handleProfileClick}
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center bg-zinc-700 rounded-full overflow-hidden"
                onClick={handleProfileClick}
              >
                <User className="h-6 w-6 text-zinc-400" />
              </div>
            )}
          </div>
          
          <div 
            className={cn(
              "flex flex-col min-w-0 overflow-hidden transition-all duration-700 ease-in-out", 
              expanded ? "opacity-100 w-full" : "opacity-0 w-0"
            )}
            onClick={handleProfileClick}
          >
            <p className="font-semibold text-white truncate hover:underline">
              {session?.user?.name || "Пользователь"}
            </p>
            <p className="text-xs text-zinc-400 truncate">
              С нами с {joinDate}
            </p>
          </div>
          
          {expanded && (
            <button 
              onClick={handleSettingsClick}
              className="p-1 hover:bg-zinc-600 rounded-full transition-colors flex-shrink-0"
              title="Настройки"
            >
              <Settings className="h-4 w-4 text-zinc-400 hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </div>

      {/* Модальное окно поиска каналов */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md bg-zinc-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Поиск каналов</h3>
              <button 
                onClick={closeSearch}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Введите название канала"
                className="w-full px-3 py-2 bg-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin h-6 w-6 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((channel) => (
                    <div
                      key={channel.id}
                      className="flex items-center justify-between p-3 bg-zinc-700 hover:bg-zinc-600 rounded-md cursor-pointer"
                      onClick={() => joinChannel(channel.id)}
                    >
                      <div className="flex items-center">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white text-sm font-semibold mr-3">
                          {getChannelInitials(channel.name)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{channel.name}</p>
                        </div>
                      </div>
                      <button className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded">
                        Присоединиться
                      </button>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() !== "" ? (
                <p className="text-center text-zinc-400 py-4">Каналы не найдены</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 