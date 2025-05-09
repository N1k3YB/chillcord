"use client";

import { useState, useEffect } from "react";
import { Shield, Save, X } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";

interface ChannelPermissionsModalProps {
  memberId: string;
  channelId: string;
  isAdmin: boolean;
  currentPermissions: {
    canDeleteChannel: boolean;
    canManageRoles: boolean;
    canRemoveMembers: boolean;
    canEditChannel: boolean;
  };
  onClose: () => void;
}

export const ChannelPermissionsModal = ({
  memberId,
  channelId,
  isAdmin,
  currentPermissions,
  onClose
}: ChannelPermissionsModalProps) => {
  const [permissions, setPermissions] = useState({
    canDeleteChannel: currentPermissions?.canDeleteChannel || false,
    canManageRoles: currentPermissions?.canManageRoles || false,
    canRemoveMembers: currentPermissions?.canRemoveMembers || false,
    canEditChannel: currentPermissions?.canEditChannel || false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  
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
  
  // Обработчик изменения разрешений
  const handlePermissionChange = (permission: string) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: !prev[permission as keyof typeof prev]
    }));
  };
  
  // Сохранение разрешений
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Отправляем запрос на обновление роли и разрешений
      await axios.patch(`/api/channels/${channelId}/members/${memberId}`, {
        role: "ADMIN", // Участник остается администратором
        permissions: permissions
      });
      
      toast.success("Разрешения успешно обновлены");
      onClose();
    } catch (error: any) {
      console.error("Ошибка при обновлении разрешений:", error);
      toast.error(error.response?.data || "Ошибка при обновлении разрешений");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-zinc-900 rounded-lg w-full max-w-md p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Shield className="h-5 w-5 text-indigo-400 mr-2" />
            Настройка разрешений
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
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
              className="h-4 w-4 accent-indigo-500 bg-zinc-700 border-zinc-600 rounded"
            />
            <label htmlFor="canDeleteChannel" className="ml-2 text-sm text-zinc-300">
              Удаление канала
            </label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2">
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
    </div>
  );
}; 