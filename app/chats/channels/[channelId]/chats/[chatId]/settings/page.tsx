"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Settings, Trash, Key, User, ArrowLeft, Shield, UserPlus, X, Check, Eye, EyeOff } from "lucide-react";
import { toast } from "react-hot-toast";
import { TabHeader } from "@/components/profile/TabHeader";
import { TabContent } from "@/components/profile/TabContent";

interface BannedUser {
  id: string;
  name: string;
}

type Tab = "general" | "protection" | "banned" | "danger";

export default function ChatSettings() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [chat, setChat] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  
  // Состояния для настроек
  const [isProtected, setIsProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [userNameToBan, setUserNameToBan] = useState("");
  const [isBanning, setIsBanning] = useState(false);
  const [isUnbanning, setIsUnbanning] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [channelMembers, setChannelMembers] = useState<{id: string; name: string}[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<{id: string; name: string}[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);

  // Получение идентификаторов из URL
  const channelId = params?.channelId as string;
  const chatId = params?.chatId as string;

  // Загрузка данных чата
  useEffect(() => {
    if (channelId && chatId) {
      loadChatData();
      loadChannelMembers();
    }
  }, [channelId, chatId]);

  // Загрузка участников канала для поиска при бане
  const loadChannelMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const response = await axios.get(`/api/channels/${channelId}/members`);
      // Извлекаем только нужные данные о пользователе
      const members = response.data.map((member: any) => ({
        id: member.user.id,
        name: member.user.name
      }));
      setChannelMembers(members);
    } catch (error) {
      console.error("Ошибка при загрузке участников канала:", error);
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Поиск пользователей для бана
  const handleSearchMembers = (searchTerm: string) => {
    setUserNameToBan(searchTerm);
    setShowMembersList(searchTerm.trim().length > 0);
    
    // Простая задержка поиска в 300 мс
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        const filtered = channelMembers.filter(member => 
          member.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredMembers(filtered);
      } else {
        setFilteredMembers([]);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  // Выбор пользователя из списка 
  const handleSelectMember = (member: {id: string; name: string}) => {
    setUserNameToBan(member.name);
    setShowMembersList(false);
  };

  // Загрузка данных чата и настроек
  const loadChatData = async () => {
    try {
      setIsLoading(true);
      // Получаем информацию о чате
      const chatResponse = await axios.get(`/api/channels/${channelId}/chats/${chatId}/settings`);
      setChat(chatResponse.data);
      setIsProtected(chatResponse.data.isProtected);
      
      // Если пароль установлен, получаем его для отображения
      if (chatResponse.data.isProtected && chatResponse.data.password) {
        setPassword(chatResponse.data.password);
      }
      
      // Получаем список забаненных пользователей
      const bannedResponse = await axios.get(`/api/channels/${channelId}/chats/${chatId}/banned`);
      setBannedUsers(bannedResponse.data);
    } catch (error) {
      console.error("Ошибка при загрузке настроек чата:", error);
      toast.error("Не удалось загрузить настройки чата");
    } finally {
      setIsLoading(false);
    }
  };

  // Сохранение настроек чата
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      await axios.patch(`/api/channels/${channelId}/chats/${chatId}/settings`, {
        isProtected,
        password: isProtected ? password : null
      });
      toast.success("Настройки чата сохранены");
    } catch (error) {
      console.error("Ошибка при сохранении настроек:", error);
      toast.error("Не удалось сохранить настройки");
    } finally {
      setIsSaving(false);
    }
  };

  // Удаление чата
  const handleDeleteChat = async () => {
    try {
      setIsDeleting(true);
      await axios.delete(`/api/channels/${channelId}/chats/${chatId}`);
      toast.success("Чат удален");
      
      // Уведомляем о необходимости обновить список чатов
      window.dispatchEvent(new CustomEvent("chat-deleted", { 
        detail: { chatId, channelId } 
      }));
      
      // Перенаправляем на страницу канала
      router.push(`/chats/channels/${channelId}`);
    } catch (error) {
      console.error("Ошибка при удалении чата:", error);
      toast.error("Не удалось удалить чат");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Бан пользователя
  const handleBanUser = async () => {
    if (!userNameToBan.trim()) {
      toast.error("Введите имя пользователя");
      return;
    }

    try {
      setIsBanning(true);
      await axios.post(`/api/channels/${channelId}/chats/${chatId}/ban`, {
        username: userNameToBan
      });
      toast.success(`Пользователь ${userNameToBan} забанен`);
      setUserNameToBan("");
      // Обновляем список забаненных пользователей
      loadChatData();
    } catch (error: any) {
      console.error("Ошибка при бане пользователя:", error);
      toast.error(error.response?.data || "Не удалось забанить пользователя");
    } finally {
      setIsBanning(false);
    }
  };

  // Разбан пользователя
  const handleUnbanUser = async (userId: string, userName: string) => {
    try {
      setIsUnbanning(userId);
      await axios.delete(`/api/channels/${channelId}/chats/${chatId}/ban/${userId}`);
      toast.success(`Пользователь ${userName} разбанен`);
      // Обновляем список забаненных пользователей
      setBannedUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Ошибка при разбане пользователя:", error);
      toast.error("Не удалось разбанить пользователя");
    } finally {
      setIsUnbanning(null);
    }
  };

  // Обработчик возврата назад к чату
  const handleNavigateBack = () => {
    router.push(`/chats/channels/${channelId}/chats/${chatId}`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <p className="text-zinc-400">Чат не найден</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-center">
          <button
            onClick={handleNavigateBack}
            className="mr-4 p-2 bg-zinc-700 hover:bg-zinc-600 rounded-full transition-colors"
            title="Назад к чату"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="h-6 w-6 text-indigo-400" />
              Настройки чата
            </h1>
            <p className="text-zinc-400">
              Управление настройками чата "{chat.name}"
            </p>
          </div>
        </header>

        {/* Вкладки настроек */}
        <div className="border-b border-zinc-700 mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("general")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "general"
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Основное
            </button>
            <button
              onClick={() => setActiveTab("protection")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "protection"
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Защита
            </button>
            <button
              onClick={() => setActiveTab("banned")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "banned"
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Бан-лист
            </button>
            <button
              onClick={() => setActiveTab("danger")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "danger"
                  ? "text-indigo-400 border-b-2 border-indigo-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Удаление чата
            </button>
          </div>
        </div>

        {/* Контент вкладки "Основное" */}
        {activeTab === "general" && (
          <TabContent>
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
              <TabHeader 
                title="Основные настройки" 
                description="Управление основными настройками чата"
                icon={Settings}
              />
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
                    Название чата
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={chat.name}
                    disabled
                    className="w-full px-3 py-2 bg-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 opacity-70"
                    placeholder="Название чата"
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Изменение названия чата пока недоступно
                  </p>
                </div>
              </div>
            </div>
          </TabContent>
        )}

        {/* Контент вкладки "Защита" */}
        {activeTab === "protection" && (
          <TabContent>
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
              <TabHeader 
                title="Защита паролем" 
                description="Защитите чат паролем, чтобы ограничить доступ"
                icon={Key}
              />
              
              <div className="space-y-4">
                <div className="flex items-center mb-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isProtected}
                      onChange={(e) => setIsProtected(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    <span className="ms-3 text-sm font-medium text-white">
                      {isProtected ? "Защита паролем включена" : "Защита паролем отключена"}
                    </span>
                  </label>
                </div>

                {isProtected && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1">
                      Пароль для доступа
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                        placeholder="Введите пароль"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-white"
                      >
                        {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      Пароль будет требоваться для входа в чат
                    </p>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md flex items-center"
                  >
                    {isSaving ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-1"></div>
                    ) : (
                      <Check className="h-4 w-4 mr-1" />
                    )}
                    Сохранить настройки
                  </button>
                </div>
              </div>
            </div>
          </TabContent>
        )}

        {/* Контент вкладки "Бан-лист" */}
        {activeTab === "banned" && (
          <TabContent>
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
              <TabHeader 
                title="Управление банами" 
                description="Блокировка и разблокировка пользователей в чате"
                icon={Shield}
              />
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-white mb-2">Забанить пользователя</h3>
                  <div className="relative">
                    <div className="flex gap-2 mb-1">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={userNameToBan}
                          onChange={(e) => handleSearchMembers(e.target.value)}
                          onFocus={() => setShowMembersList(userNameToBan.trim().length > 0)}
                          onBlur={() => setTimeout(() => setShowMembersList(false), 200)}
                          placeholder="Имя пользователя"
                          className="w-full p-2 bg-zinc-700 text-white border border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {showMembersList && filteredMembers.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-md overflow-hidden shadow-lg z-10 max-h-60 overflow-y-auto">
                            {filteredMembers.map(member => (
                              <div
                                key={member.id}
                                className="p-2 hover:bg-zinc-700 cursor-pointer flex items-center"
                                onClick={() => handleSelectMember(member)}
                              >
                                <User className="h-4 w-4 mr-2 text-indigo-400" />
                                <span className="text-white">{member.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {isLoadingMembers && (
                          <div className="absolute right-3 top-2.5">
                            <div className="animate-spin h-4 w-4 border-2 border-indigo-400 rounded-full border-t-transparent"></div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleBanUser}
                        disabled={isBanning || !userNameToBan.trim()}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isBanning ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Введите имя пользователя или выберите из списка участников канала
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-md font-medium text-white mb-2">Забаненные пользователи</h3>
                  <div className="bg-zinc-800 rounded-md p-4 border border-zinc-700">
                    {bannedUsers.length === 0 ? (
                      <p className="text-zinc-500 text-sm">Нет забаненных пользователей</p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {bannedUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-2 bg-zinc-700 rounded-md">
                            <span className="text-white flex items-center">
                              <User className="h-4 w-4 mr-2 text-red-400" />
                              {user.name}
                            </span>
                            <button
                              onClick={() => handleUnbanUser(user.id, user.name)}
                              disabled={isUnbanning === user.id}
                              className="text-xs px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                            >
                              {isUnbanning === user.id ? (
                                <div className="animate-spin h-3 w-3 border-2 border-white rounded-full border-t-transparent"></div>
                              ) : (
                                "Разбанить"
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabContent>
        )}

        {/* Контент вкладки "Опасная зона" */}
        {activeTab === "danger" && (
          <TabContent>
            <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
              <TabHeader 
                title="Удаление чата" 
                description="Необратимые действия с чатом"
                icon={Trash}
              />
              
              <div className="bg-red-900/20 p-4 rounded-md border border-red-900/40 mt-4">
                <h3 className="text-lg font-medium text-red-400 mb-2">Удаление чата</h3>
                <p className="text-zinc-300 mb-4">
                  Удаление чата приведет к потере всех сообщений и настроек. Это действие нельзя отменить.
                </p>
                
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full p-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                  >
                    Удалить чат
                  </button>
                ) : (
                  <div className="bg-zinc-800 p-3 rounded-md">
                    <p className="text-white mb-3">
                      Вы уверены, что хотите удалить чат <strong>{chat.name}</strong>? Это действие нельзя отменить.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 p-2 bg-zinc-700 text-white rounded-md"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleDeleteChat}
                        disabled={isDeleting}
                        className="flex-1 p-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center"
                      >
                        {isDeleting ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-1"></div>
                        ) : (
                          <Trash className="h-4 w-4 mr-1" />
                        )}
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabContent>
        )}
      </div>
    </div>
  );
} 