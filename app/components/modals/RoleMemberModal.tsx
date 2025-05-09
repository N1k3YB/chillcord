"use client";

import { useState, useEffect } from "react";
import { Shield, Save, X, UserMinus, User, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

interface RoleMemberModalProps {
  memberId: string;
  channelId: string;
  memberName: string;
  isAdmin: boolean;
  isOwner: boolean;
  currentPermissions?: {
    canDeleteChannel: boolean;
    canManageRoles: boolean;
    canRemoveMembers: boolean;
    canEditChannel: boolean;
  };
  onClose: () => void;
}

export const RoleMemberModal = ({
  memberId,
  channelId,
  memberName,
  isAdmin,
  isOwner,
  currentPermissions,
  onClose
}: RoleMemberModalProps) => {
  const [role, setRole] = useState(isAdmin ? "ADMIN" : "MEMBER");
  const [permissions, setPermissions] = useState({
    canDeleteChannel: currentPermissions?.canDeleteChannel || false,
    canManageRoles: currentPermissions?.canManageRoles || false,
    canRemoveMembers: currentPermissions?.canRemoveMembers || false,
    canEditChannel: currentPermissions?.canEditChannel || false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  
  // Обработчик нажатия на клавишу Escape для закрытия модального окна
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);
  
  // Обработчик изменения роли
  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
  };
  
  // Обработчик изменения разрешений
  const handlePermissionChange = (permission: string) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission as keyof typeof prev]
    }));
  };
  
  // Сохранение роли и разрешений
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Подготавливаем данные для запроса
      const requestData: any = {
        role: role
      };
      
      // Если выбрана роль ADMIN, передаем и разрешения
      if (role === "ADMIN") {
        requestData.permissions = permissions;
      }
      
      // Отправляем запрос на обновление роли и разрешений
      await axios.patch(`/api/channels/${channelId}/members/${memberId}`, requestData);
      
      toast.success(`Роль ${memberName} успешно обновлена`);
      onClose();
    } catch (error: any) {
      console.error("Ошибка при обновлении роли:", error);
      toast.error(error.response?.data || "Ошибка при обновлении роли");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Удаление пользователя из канала
  const handleRemoveMember = async () => {
    try {
      setIsRemoving(true);
      
      // Отправляем запрос на удаление участника
      await axios.delete(`/api/channels/${channelId}/members/${memberId}`);
      
      toast.success(`Пользователь ${memberName} удален из канала`);
      onClose();
    } catch (error: any) {
      console.error("Ошибка при удалении участника:", error);
      toast.error(error.response?.data || "Ошибка при удалении участника");
    } finally {
      setIsRemoving(false);
      setShowRemoveConfirm(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-zinc-900 rounded-lg w-full max-w-md p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Shield className="h-5 w-5 text-indigo-400 mr-2" />
            Управление участником: {memberName}
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {!showRemoveConfirm ? (
          <>
            <div className="mb-6">
              <h3 className="text-sm font-medium text-zinc-300 mb-2">Роль пользователя</h3>
              <div className="flex gap-4 mb-4">
                <div 
                  className={`flex items-center border rounded-md p-2 cursor-pointer ${
                    role === "MEMBER" ? "border-indigo-500 bg-indigo-500/20" : "border-zinc-700 bg-zinc-800"
                  }`}
                  onClick={() => handleRoleChange("MEMBER")}
                >
                  <User className="h-4 w-4 mr-2 text-zinc-300" />
                  <span className="text-sm text-zinc-300">Участник</span>
                </div>
                <div 
                  className={`flex items-center border rounded-md p-2 cursor-pointer ${
                    role === "ADMIN" ? "border-indigo-500 bg-indigo-500/20" : "border-zinc-700 bg-zinc-800"
                  }`}
                  onClick={() => handleRoleChange("ADMIN")}
                >
                  <Shield className="h-4 w-4 mr-2 text-indigo-400" />
                  <span className="text-sm text-zinc-300">Администратор</span>
                </div>
              </div>
            </div>
            
            {role === "ADMIN" && (
              <div className="space-y-4 mb-6">
                <h3 className="text-sm font-medium text-zinc-300 mb-2">Разрешения администратора</h3>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canEditChannel"
                    checked={permissions.canEditChannel}
                    onChange={() => handlePermissionChange("canEditChannel")}
                    className="h-4 w-4 accent-indigo-500 bg-zinc-700 border-zinc-600 rounded"
                  />
                  <label htmlFor="canEditChannel" className="ml-2 text-sm text-zinc-300">
                    Редактирование настроек канала
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canRemoveMembers"
                    checked={permissions.canRemoveMembers}
                    onChange={() => handlePermissionChange("canRemoveMembers")}
                    className="h-4 w-4 accent-indigo-500 bg-zinc-700 border-zinc-600 rounded"
                  />
                  <label htmlFor="canRemoveMembers" className="ml-2 text-sm text-zinc-300">
                    Удаление участников
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canManageRoles"
                    checked={permissions.canManageRoles}
                    onChange={() => handlePermissionChange("canManageRoles")}
                    className="h-4 w-4 accent-indigo-500 bg-zinc-700 border-zinc-600 rounded"
                  />
                  <label htmlFor="canManageRoles" className="ml-2 text-sm text-zinc-300">
                    Управление ролями
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="canDeleteChannel"
                    checked={permissions.canDeleteChannel}
                    onChange={() => handlePermissionChange("canDeleteChannel")}
                    disabled={!isOwner}
                    className={`h-4 w-4 accent-indigo-500 bg-zinc-700 border-zinc-600 rounded ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <label 
                    htmlFor="canDeleteChannel" 
                    className={`ml-2 text-sm text-zinc-300 ${!isOwner ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Удаление канала {!isOwner && "(только владелец может назначать)"}
                  </label>
                </div>
              </div>
            )}
            
            <div className="flex justify-between">
              <button
                onClick={() => setShowRemoveConfirm(true)}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md focus:outline-none flex items-center"
              >
                <UserMinus className="h-4 w-4 mr-1" />
                Удалить из канала
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md focus:outline-none"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md focus:outline-none flex items-center"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-1"></div>
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1" />
                      Сохранить
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-4">
            <div className="flex items-center mb-4 p-3 bg-red-900/30 rounded-lg border border-red-800/50">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" />
              <p className="text-white">
                Вы уверены, что хотите удалить пользователя <strong>{memberName}</strong> из канала? Это действие нельзя отменить.
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md focus:outline-none"
              >
                Отмена
              </button>
              <button
                onClick={handleRemoveMember}
                disabled={isRemoving}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md focus:outline-none flex items-center"
              >
                {isRemoving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-1"></div>
                    Удаление...
                  </>
                ) : (
                  <>
                    <UserMinus className="h-4 w-4 mr-1" />
                    Удалить
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 