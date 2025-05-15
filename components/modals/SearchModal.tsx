"use client";

import { useEffect, useState } from "react";
import { X, Search, Hash, Plus } from "lucide-react";
import axios from "@/lib/axios";
import { ConfirmJoinModal } from "@/app/components/modals/ConfirmJoinModal";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'channels' | 'users';
}

interface Channel {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  inviteCode?: string;
}

interface User {
  id: string;
  username: string;
  name: string | null;
  email: string;
  image: string | null;
  status: string;
  matchType: string;
}

export const SearchModal = ({ isOpen, onClose, initialTab = 'channels' }: SearchModalProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'channels' | 'users'>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [channelResults, setChannelResults] = useState<Channel[]>([]);
  const [userResults, setUserResults] = useState<User[]>([]);
  const [confirmJoinChannel, setConfirmJoinChannel] = useState<Channel | null>(null);
  const [isAddingFriend, setIsAddingFriend] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Обработчик смены вкладки
  const handleTabChange = (tab: 'channels' | 'users') => {
    setActiveTab(tab);
    setSearchQuery("");
    setChannelResults([]);
    setUserResults([]);
  };

  // Поиск каналов
  const searchChannels = async (query: string) => {
    if (!query.trim()) {
      setChannelResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await axios.get(`/api/channels/search?query=${encodeURIComponent(query)}`);
      setChannelResults(response.data);
    } catch (error) {
      console.error("Ошибка при поиске каналов:", error);
      setChannelResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Поиск пользователей
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUserResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const response = await axios.get(`/api/users/search?query=${encodeURIComponent(query)}`);
      setUserResults(response.data);
    } catch (error) {
      console.error("Ошибка при поиске пользователей:", error);
      setUserResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Обработка изменения запроса поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        if (activeTab === 'channels') {
          searchChannels(searchQuery);
        } else {
          searchUsers(searchQuery);
        }
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);

  // Подготовка к присоединению к каналу
  const prepareJoinChannel = (channel: Channel) => {
    setConfirmJoinChannel(channel);
  };

  // Закрытие модального окна подтверждения
  const closeConfirmJoinModal = () => {
    setConfirmJoinChannel(null);
  };

  // Присоединение к каналу
  const joinChannel = async (channelId: string, inviteCode?: string) => {
    try {
      if (inviteCode) {
        // Если есть код приглашения, используем API для присоединения по коду
        await axios.post(`/api/invites/${inviteCode}`);
      } else {
        // Иначе присоединяемся обычным способом
        await axios.post(`/api/channels/${channelId}/join`);
      }
      
      // Закрываем модальные окна
      setConfirmJoinChannel(null);
      onClose();
      
      // Переходим в канал
      router.push(`/chats/channels/${channelId}`);
      
      toast.success("Вы успешно присоединились к каналу");
    } catch (error) {
      console.error("Ошибка при присоединении к каналу:", error);
      toast.error("Не удалось присоединиться к каналу");
    }
  };

  // Добавление пользователя в друзья
  const addFriend = async (userId: string) => {
    try {
      setIsAddingFriend(userId);
      
      await axios.post(`/api/friends/${userId}`);
      
      toast.success("Запрос на добавление в друзья отправлен");
      
      // Удаляем пользователя из результатов поиска после добавления
      setUserResults(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Ошибка при добавлении в друзья:", error);
      toast.error("Не удалось отправить запрос на добавление в друзья");
    } finally {
      setIsAddingFriend(null);
    }
  };

  // Начало личного чата с пользователем
  const startDirectChat = (userId: string) => {
    router.push(`/chats/direct/${userId}`);
    onClose();
  };

  // Получение инициалов из имени
  const getInitials = (name: string) => {
    return name.slice(0, 2).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-zinc-800 rounded-lg w-full max-w-md p-4 mx-4 animate-fade-in">
        {/* Заголовок и кнопка закрытия */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-medium">Поиск</h3>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Вкладки поиска */}
        <div className="flex border-b border-zinc-700 mb-4">
          <button 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'channels' 
                ? "text-white border-b-2 border-indigo-500" 
                : "text-zinc-400 hover:text-white"
            }`}
            onClick={() => handleTabChange('channels')}
          >
            <Hash className="h-4 w-4" />
            Каналы
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'users' 
                ? "text-white border-b-2 border-indigo-500" 
                : "text-zinc-400 hover:text-white"
            }`}
            onClick={() => handleTabChange('users')}
          >
            <Search className="h-4 w-4" />
            Пользователи
          </button>
        </div>
        
        {/* Поисковая строка */}
        <div className="relative mb-4">
          <input
            type="text"
            className="w-full px-3 py-2 pl-10 bg-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'channels' 
              ? "Поиск по названию или коду приглашения" 
              : "Поиск по имени пользователя или коду"
            }
            autoFocus
          />
          <Search className="h-5 w-5 text-zinc-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
        
        {/* Результаты поиска */}
        <div className="max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
            </div>
          ) : activeTab === 'channels' ? (
            // Результаты поиска каналов
            channelResults.length > 0 ? (
              <div className="space-y-2">
                {channelResults.map((channel) => (
                  <div 
                    key={channel.id} 
                    className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-md transition-colors cursor-pointer"
                    onClick={() => prepareJoinChannel(channel)}
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
                        <span className="text-white font-bold">
                          {getInitials(channel.name)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-white font-medium truncate">{channel.name}</p>
                          {channel.inviteCode && (
                            <span className="ml-2 text-xs bg-green-600/30 text-green-300 px-2 py-0.5 rounded">
                              По коду
                            </span>
                          )}
                        </div>
                        {channel.description && (
                          <p className="text-zinc-400 text-sm truncate">{channel.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.trim() !== "" ? (
              <div className="text-center py-8">
                <p className="text-zinc-400 mb-2">Ничего не найдено</p>
                <p className="text-zinc-500 text-sm">
                  Попробуйте ввести другое название или код приглашения
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-400 mb-2">Начните вводить запрос</p>
                <p className="text-zinc-500 text-sm">
                  Введите название канала или код приглашения для поиска
                </p>
              </div>
            )
          ) : (
            // Результаты поиска пользователей
            userResults.length > 0 ? (
              <div className="space-y-2">
                {userResults.map((user) => (
                  <div 
                    key={user.id} 
                    className="p-3 bg-zinc-700 hover:bg-zinc-600 rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-indigo-600 flex items-center justify-center mr-3">
                        {user.image ? (
                          <img src={user.image} alt={user.username} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-white font-bold">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {user.name || user.username}
                        </p>
                        <p className="text-zinc-400 text-sm truncate">
                          {user.username}
                          {user.matchType === "inviteCode" && (
                            <span className="ml-2 text-xs bg-green-600/30 text-green-300 px-2 py-0.5 rounded">
                              По коду
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addFriend(user.id)}
                          disabled={isAddingFriend === user.id}
                          className={`p-2 rounded text-white text-xs transition-colors ${
                            isAddingFriend === user.id
                              ? "bg-indigo-800 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700"
                          }`}
                          title="Добавить в друзья"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => startDirectChat(user.id)}
                          className="p-2 bg-zinc-600 hover:bg-zinc-500 rounded text-white text-xs transition-colors"
                          title="Начать чат"
                        >
                          <Hash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.trim() !== "" ? (
              <div className="text-center py-8">
                <p className="text-zinc-400 mb-2">Пользователи не найдены</p>
                <p className="text-zinc-500 text-sm">
                  Попробуйте ввести другое имя пользователя или код
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-400 mb-2">Начните вводить запрос</p>
                <p className="text-zinc-500 text-sm">
                  Введите имя пользователя или код для поиска
                </p>
              </div>
            )
          )}
        </div>
      </div>
      
      {/* Модальное окно подтверждения присоединения к каналу */}
      {confirmJoinChannel && (
        <ConfirmJoinModal
          channelName={confirmJoinChannel.name}
          isPublic={confirmJoinChannel.isPublic}
          onConfirm={() => joinChannel(confirmJoinChannel.id, confirmJoinChannel.inviteCode)}
          onCancel={closeConfirmJoinModal}
        />
      )}
    </div>
  );
}; 