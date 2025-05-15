"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Settings, Users, LogOut, MoreVertical, Edit, Trash2 } from "lucide-react";
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

interface ChatUser {
  id: string;
  name: string | null;
  image: string | null;
  role: string;
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
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState<string | null>(null);
  const [isRenamingChat, setIsRenamingChat] = useState<string | null>(null);
  const [newChatName, setNewChatName] = useState("");
  const [isDeletingChat, setIsDeletingChat] = useState<string | null>(null);
  const chatMenuRef = useRef<HTMLDivElement>(null);
  
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
    
    // Обработчик события создания нового чата
    const handleChatCreated = (event: CustomEvent<{ channelId: string, chat: Chat }>) => {
      if (event.detail.channelId === activeChannelId) {
        // Добавляем новый чат в список, если он относится к текущему каналу
        setActiveChannelChats(prev => [...prev, event.detail.chat]);
      }
    };
    
    // Регистрируем обработчик события
    window.addEventListener("chat-created" as any, handleChatCreated);
    
    // Удаляем обработчик при размонтировании компонента
    return () => {
      window.removeEventListener("chat-created" as any, handleChatCreated);
    };
  }, [activeChannelId, activeChannel, blockedChannelIds]);
  
  // Загружаем пользователей чата при наведении мыши на чат
  useEffect(() => {
    if (hoveredChatId && activeChannelId) {
      const fetchChatUsers = async () => {
        setLoadingUsers(true);
        try {
          // Изменяем на API для получения онлайн пользователей
          const response = await axios.get(`/api/channels/${activeChannelId}/chats/${hoveredChatId}/online`);
          setChatUsers(response.data);
        } catch (error: any) {
          console.error("Ошибка при загрузке пользователей чата:", error);
          // Проверяем сообщение об ошибке от сервера
          const errorMessage = error.response?.data || "Не удалось загрузить пользователей";
          if (errorMessage === "Сокет-сервер не инициализирован") {
            // Если сокет не инициализирован, пробуем получить обычных пользователей чата
            try {
              const fallbackResponse = await axios.get(`/api/channels/${activeChannelId}/chats/${hoveredChatId}/users`);
              setChatUsers(fallbackResponse.data);
            } catch (fallbackError) {
              console.error("Ошибка при загрузке обычных пользователей:", fallbackError);
              setChatUsers([]);
            }
          } else {
            setChatUsers([]);
          }
        } finally {
          setLoadingUsers(false);
        }
      };
      
      const handleUserJoinedChat = (e: CustomEvent<{ chatId: string, userId: string }>) => {
        if (e.detail.chatId === hoveredChatId) {
          console.log("Обновление списка пользователей после входа в чат");
          fetchChatUsers();
        }
      };
      
      const handleUserLeftChat = (e: CustomEvent<{ chatId: string, userId: string }>) => {
        if (e.detail.chatId === hoveredChatId) {
          console.log("Обновление списка пользователей после выхода из чата");
          fetchChatUsers();
        }
      };
      
      // Регистрируем обработчики событий входа и выхода пользователей
      window.addEventListener("user-joined-chat" as any, handleUserJoinedChat);
      window.addEventListener("user-left-chat" as any, handleUserLeftChat);
      
      // Небольшая задержка перед запросом, чтобы избежать лишних запросов при быстром перемещении мыши
      const timer = setTimeout(fetchChatUsers, 300);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener("user-joined-chat" as any, handleUserJoinedChat);
        window.removeEventListener("user-left-chat" as any, handleUserLeftChat);
      };
    }
  }, [hoveredChatId, activeChannelId]);
  
  // Закрываем меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(event.target as Node)) {
        setShowChatMenu(null);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
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
  
  // Переименование чата
  const handleRenameChat = async (chatId: string) => {
    if (!newChatName.trim() || !activeChannelId) return;
    
    try {
      const response = await axios.patch(`/api/channels/${activeChannelId}/chats/${chatId}`, {
        name: newChatName
      });
      
      // Обновляем чат в списке
      setActiveChannelChats(prev => 
        prev.map(chat => 
          chat.id === chatId ? { ...chat, name: newChatName } : chat
        )
      );
      
      toast.success("Чат переименован");
      setIsRenamingChat(null);
      setNewChatName("");
      setShowChatMenu(null);
    } catch (error) {
      console.error("Ошибка при переименовании чата:", error);
      toast.error("Не удалось переименовать чат");
    }
  };
  
  // Удаление чата
  const handleDeleteChat = async (chatId: string) => {
    if (!activeChannelId) return;
    
    try {
      setIsDeletingChat(chatId);
      await axios.delete(`/api/channels/${activeChannelId}/chats/${chatId}`);
      
      // Удаляем чат из списка
      setActiveChannelChats(prev => prev.filter(chat => chat.id !== chatId));
      
      toast.success("Чат удален");
      
      // Если мы находимся в этом чате, перенаправляем на страницу канала
      if (activeChatId === chatId) {
        router.push(`/chats/channels/${activeChannelId}`);
      }
    } catch (error) {
      console.error("Ошибка при удалении чата:", error);
      toast.error("Не удалось удалить чат");
    } finally {
      setIsDeletingChat(null);
      setShowChatMenu(null);
    }
  };
  
  // Модифицированный список чатов в ChannelContent
  const renderChats = () => {
    if (activeChannelChats.length === 0) {
      return (
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
      );
    }
    
    return (
      <div className="space-y-1">
        {activeChannelChats.map((chat) => (
          <div key={chat.id} className="relative">
            <div 
              className="flex items-center justify-between"
              onMouseEnter={() => setHoveredChatId(chat.id)}
              onMouseLeave={() => setHoveredChatId(null)}
            >
              <Link
                href={`/chats/channels/${activeChannelId}/chats/${chat.id}`}
                className={cn(
                  "flex-1 flex items-center gap-2 py-2 px-3 rounded-full text-sm transition-colors",
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
              
              {activeChannel?.role === "ADMIN" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowChatMenu(showChatMenu === chat.id ? null : chat.id);
                  }}
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center transition-colors ml-1",
                    showChatMenu === chat.id ? "bg-zinc-600 text-white" : "text-zinc-400 hover:bg-zinc-600/50 hover:text-white"
                  )}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            
            {/* Меню настроек чата */}
            {showChatMenu === chat.id && (
              <div 
                ref={chatMenuRef}
                className="absolute right-1 top-8 z-50 bg-zinc-800 rounded-md shadow-lg border border-zinc-700 w-44 overflow-hidden py-1"
              >
                {isRenamingChat === chat.id ? (
                  <div className="p-2">
                    <input
                      type="text"
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                      placeholder={chat.name}
                      className="w-full px-2 py-1 bg-zinc-700 rounded text-white text-sm"
                      autoFocus
                    />
                    <div className="flex items-center justify-end gap-1 mt-2">
                      <button
                        onClick={() => {
                          setIsRenamingChat(null);
                          setNewChatName("");
                        }}
                        className="px-2 py-1 text-xs text-zinc-300 hover:text-white"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={() => handleRenameChat(chat.id)}
                        disabled={!newChatName.trim()}
                        className="px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded disabled:opacity-50"
                      >
                        Сохранить
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setIsRenamingChat(chat.id);
                        setNewChatName(chat.name);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Переименовать
                    </button>
                    <button
                      onClick={() => handleDeleteChat(chat.id)}
                      disabled={isDeletingChat === chat.id}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-zinc-700 hover:text-red-300 disabled:opacity-50"
                    >
                      {isDeletingChat === chat.id ? (
                        <div className="animate-spin h-3.5 w-3.5 border-2 border-red-300 rounded-full border-t-transparent"></div>
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      Удалить
                    </button>
                  </>
                )}
              </div>
            )}
            
            {/* Пользователи в чате */}
            {hoveredChatId === chat.id && (
              <div className="absolute left-full ml-2 top-0 z-50 bg-zinc-800 rounded-md shadow-lg border border-zinc-700 w-60">
                <div className="p-2">
                  <h3 className="text-sm font-medium text-white mb-2 flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1 text-indigo-400" />
                    Онлайн в чате
                  </h3>
                  
                  {loadingUsers ? (
                    <div className="flex justify-center py-2">
                      <div className="animate-spin h-4 w-4 border-2 border-indigo-400 rounded-full border-t-transparent"></div>
                    </div>
                  ) : chatUsers.length === 0 ? (
                    <p className="text-xs text-zinc-400 py-1">Никого нет онлайн</p>
                  ) : (
                    <div className="max-h-40 overflow-y-auto">
                      {chatUsers.map((user) => (
                        <div key={user.id} className="flex items-center py-1.5 px-2 hover:bg-zinc-700/50 rounded">
                          {user.image ? (
                            <img src={user.image} alt={user.name || 'Пользователь'} className="h-5 w-5 rounded-full mr-2" />
                          ) : (
                            <div className="h-5 w-5 rounded-full bg-zinc-600 mr-2 flex items-center justify-center">
                              <span className="text-[10px]">{user.name?.charAt(0) || '?'}</span>
                            </div>
                          )}
                          <span className="text-xs text-zinc-300 truncate">{user.name}</span>
                          {user.role === "ADMIN" && (
                            <span className="ml-auto text-[10px] text-indigo-400">Админ</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
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
      {renderChats()}
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