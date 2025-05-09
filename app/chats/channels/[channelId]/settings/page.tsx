"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Settings, Trash2, Users, Globe, ArrowLeft, Shield, UserPlus, Crown, Copy, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { ChannelPermissionsModal } from "@/app/components/modals/ChannelPermissionsModal";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  role: string;
  ownerId: string;
}

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    image: string;
  };
  permissions?: {
    canDeleteChannel: boolean;
    canManageRoles: boolean;
    canRemoveMembers: boolean;
    canEditChannel: boolean;
  };
}

export default function ChannelSettings() {
  const params = useParams();
  const router = useRouter();
  const channelId = params?.channelId as string;
  
  const [channel, setChannel] = useState<Channel | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    const fetchChannel = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/channels/${channelId}`);
        setChannel(response.data);
        setName(response.data.name);
        setDescription(response.data.description || "");
        setIsPublic(response.data.isPublic);
      } catch (error) {
        console.error("Ошибка при загрузке канала:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (channelId) {
      fetchChannel();
    }
  }, [channelId]);
  
  useEffect(() => {
    const fetchMembers = async () => {
      if (!channelId || !channel || channel.role !== "ADMIN") return;
      
      try {
        setIsLoadingMembers(true);
        const response = await axios.get(`/api/channels/${channelId}/members`);
        setMembers(response.data);
        
        // Получаем текущего пользователя для проверки прав
        const userResponse = await axios.get('/api/auth/me');
        setCurrentUser(userResponse.data);
      } catch (error) {
        console.error("Ошибка при загрузке участников:", error);
      } finally {
        setIsLoadingMembers(false);
      }
    };
    
    fetchMembers();
  }, [channelId, channel]);
  
  const handleUpdate = async () => {
    if (!channelId || !channel || channel.role !== "ADMIN") return;
    
    try {
      setIsUpdating(true);
      
      await axios.patch(`/api/channels/${channelId}`, {
        name,
        description: description || null,
        isPublic
      });
      
      router.refresh();
    } catch (error) {
      console.error("Ошибка при обновлении канала:", error);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleDeleteChannel = async () => {
    if (!channelId || !channel) return;
    
    if (!confirm("Вы уверены, что хотите удалить канал? Это действие невозможно отменить.")) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // Сохраняем идентификатор канала для отправки события
      const channelIdToDelete = channelId;
      
      // Отправляем запрос на удаление канала
      await axios.delete(`/api/channels/${channelId}`);
      
      // Показываем сообщение об успехе
      toast.success("Канал успешно удален");
      
      // Отправляем событие об удалении канала
      const event = new CustomEvent("channel-deleted", {
        detail: { channelId: channelIdToDelete }
      });
      window.dispatchEvent(event);
      
      // Перенаправляем на главную страницу
      router.push("/chats");
    } catch (error) {
      console.error("Ошибка при удалении канала:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleUpdateRole = async (memberId: string, newRole: string) => {
    if (!channelId || !channel || channel.role !== "ADMIN") return;
    
    try {
      setIsUpdatingRole(memberId);
      
      await axios.patch(`/api/channels/${channelId}/members/${memberId}`, {
        role: newRole
      });
      
      // Обновляем список участников
      const updatedMembers = members.map(member => {
        if (member.id === memberId) {
          return { ...member, role: newRole };
        }
        return member;
      });
      
      setMembers(updatedMembers);
    } catch (error) {
      console.error("Ошибка при обновлении роли:", error);
    } finally {
      setIsUpdatingRole(null);
    }
  };
  
  const handleRemoveMember = async (memberId: string) => {
    if (!channelId || !channel || channel.role !== "ADMIN") return;
    
    if (!confirm("Вы уверены, что хотите удалить этого участника из канала?")) {
      return;
    }
    
    try {
      setIsUpdatingRole(memberId);
      
      await axios.delete(`/api/channels/${channelId}/members/${memberId}`);
      
      // Удаляем участника из списка
      const updatedMembers = members.filter(member => member.id !== memberId);
      setMembers(updatedMembers);
    } catch (error) {
      console.error("Ошибка при удалении участника:", error);
    } finally {
      setIsUpdatingRole(null);
    }
  };
  
  const handleNavigateBack = () => {
    router.push(`/chats/channels/${channelId}`);
  };
  
  // Проверяем, является ли участник владельцем канала
  const isChannelOwner = (userId: string) => {
    return channel?.ownerId === userId;
  };
  
  // Создание приглашения и генерация ссылки
  const handleCreateInvite = async () => {
    try {
      setIsCreatingInvite(true);
      
      // Вызываем API для создания нового приглашения
      const response = await axios.post(`/api/channels/${channelId}/invites`, {});
      
      // Создаем ссылку для приглашения
      const inviteCode = response.data.code;
      const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
      
      setInviteLink(inviteUrl);
    } catch (error) {
      console.error("Ошибка при создании приглашения:", error);
    } finally {
      setIsCreatingInvite(false);
    }
  };
  
  // Копирование ссылки приглашения в буфер обмена
  const handleCopyInvite = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      
      // Сбрасываем состояние копирования через 2 секунды
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };
  
  const handleManagePermissions = (memberId: string) => {
    setSelectedMember(memberId);
    setShowPermissionsModal(true);
  };
  
  const handleClosePermissionsModal = () => {
    setShowPermissionsModal(false);
    setSelectedMember(null);
    // Обновляем список участников после изменения разрешений
    fetchMembers();
  };
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen">
        <p className="text-zinc-400">Канал не найден</p>
      </div>
    );
  }
  
  if (channel.role !== "ADMIN") {
    return (
      <div className="flex-1 flex items-center justify-center flex-col p-6 h-screen">
        <Settings className="h-16 w-16 text-zinc-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-300 mb-2">Доступ запрещен</h2>
        <p className="text-zinc-400 text-center">
          Только администратор канала может изменять настройки.
        </p>
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
            title="Назад к каналу"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="h-6 w-6 text-indigo-400" />
              Настройки канала
            </h1>
            <p className="text-zinc-400">
              Управление настройками канала "{channel.name}"
            </p>
          </div>
        </header>
        
        <div className="space-y-8">
          <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-lg font-medium text-white mb-4">Основные настройки</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
                  Название канала
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Введите название канала"
                  disabled={isUpdating}
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-1">
                  Описание (необязательно)
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Введите описание канала"
                  rows={3}
                  disabled={isUpdating}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="isPublic"
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="h-4 w-4 accent-indigo-500 bg-zinc-700 border-zinc-600 rounded"
                  disabled={isUpdating}
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-zinc-300 flex items-center">
                  <Globe className="h-4 w-4 mr-1 text-zinc-400" />
                  Публичный канал (виден всем в поиске)
                </label>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? "Сохранение..." : "Сохранить изменения"}
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center">
              <Users className="h-5 w-5 text-indigo-400 mr-2" />
              Участники канала
            </h2>
            
            {isLoadingMembers ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin h-8 w-8 border-4 border-indigo-500 rounded-full border-t-transparent"></div>
              </div>
            ) : members.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 rounded-md bg-zinc-700/50">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-zinc-600 flex items-center justify-center mr-3 overflow-hidden">
                          {member.user.image ? (
                            <img src={member.user.image} alt={member.user.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-white font-semibold">{member.user.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{member.user.name}</p>
                          <div className="flex items-center mt-1">
                            {isChannelOwner(member.user.id) ? (
                              <span className="text-xs bg-amber-600/30 text-amber-300 px-2 py-0.5 rounded flex items-center">
                                <Crown className="h-3 w-3 mr-1" />
                                Владелец
                              </span>
                            ) : member.role === "ADMIN" ? (
                              <span className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-0.5 rounded flex items-center">
                                <Shield className="h-3 w-3 mr-1" />
                                Администратор
                              </span>
                            ) : (
                              <span className="text-xs bg-zinc-600/30 text-zinc-300 px-2 py-0.5 rounded">
                                Участник
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {!isChannelOwner(member.user.id) && (
                          <>
                            {member.role !== "ADMIN" && (
                              <button
                                onClick={() => handleUpdateRole(member.id, "ADMIN")}
                                disabled={isUpdatingRole === member.id}
                                className="p-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-md transition-colors text-xs"
                                title="Сделать администратором"
                              >
                                {isUpdatingRole === member.id ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                                ) : (
                                  <div className="flex items-center">
                                    <Shield className="h-4 w-4" />
                                  </div>
                                )}
                              </button>
                            )}
                            
                            {member.role === "ADMIN" && (
                              <button
                                onClick={() => handleUpdateRole(member.id, "MEMBER")}
                                disabled={isUpdatingRole === member.id}
                                className="p-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-md transition-colors text-xs"
                                title="Снять администратора"
                              >
                                {isUpdatingRole === member.id ? (
                                  <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                                ) : (
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4" />
                                  </div>
                                )}
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={isUpdatingRole === member.id}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-xs"
                              title="Удалить участника"
                            >
                              {isUpdatingRole === member.id ? (
                                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                              ) : (
                                <div className="flex items-center">
                                  <Trash2 className="h-4 w-4" />
                                </div>
                              )}
                            </button>
                          </>
                        )}
                        {/* Кнопка управления разрешениями (только для админов) */}
                        {member.role === "ADMIN" && channel?.ownerId === currentUser?.id && (
                          <button
                            onClick={() => handleManagePermissions(member.id)}
                            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                            title="Настроить разрешения"
                          >
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-2">
                  {!inviteLink ? (
                    <button
                      type="button"
                      onClick={handleCreateInvite}
                      disabled={isCreatingInvite}
                      className="px-4 py-2 text-sm font-medium text-white bg-zinc-700 hover:bg-zinc-600 rounded-md focus:outline-none focus:ring-2 flex items-center gap-1"
                    >
                      {isCreatingInvite ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-1"></div>
                          Создание ссылки...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Пригласить участников
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <div className="text-sm text-zinc-300 mb-1">Ссылка для приглашения:</div>
                      <div className="flex">
                        <input
                          type="text"
                          value={inviteLink}
                          readOnly
                          className="flex-1 px-3 py-2 bg-zinc-700 rounded-l-md text-white focus:outline-none"
                        />
                        <button
                          onClick={handleCopyInvite}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-md focus:outline-none"
                        >
                          {isCopied ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            <Copy className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-zinc-400">Любой, у кого есть эта ссылка, может присоединиться к каналу.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-zinc-400 py-4 text-center">В канале пока нет участников</p>
            )}
          </div>
          
          <div className="bg-red-900/20 p-6 rounded-lg border border-red-800/50">
            <h2 className="text-lg font-medium text-white mb-4 flex items-center">
              <Trash2 className="h-5 w-5 text-red-500 mr-2" />
              Удаление канала
            </h2>
            
            <p className="text-zinc-400 mb-4">
              Это действие невозможно отменить. Все чаты, сообщения и данные канала будут удалены навсегда.
            </p>
            
            <button
              type="button"
              onClick={handleDeleteChannel}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Удаление..." : "Удалить канал"}
            </button>
          </div>
        </div>
      </div>
      {/* Модальное окно управления разрешениями */}
      {showPermissionsModal && selectedMember && (
        <ChannelPermissionsModal
          memberId={selectedMember}
          channelId={channelId as string}
          isAdmin={true}
          currentPermissions={
            members.find(member => member.id === selectedMember)?.permissions || {
              canDeleteChannel: false,
              canManageRoles: false,
              canRemoveMembers: false,
              canEditChannel: false
            }
          }
          onClose={handleClosePermissionsModal}
        />
      )}
    </div>
  );
} 