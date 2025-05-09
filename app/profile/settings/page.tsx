"use client";

import { LogoutButton } from "@/components/profile/LogoutButton";

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Настройки</h1>
        <p className="text-zinc-400 mt-1">
          Управление настройками аккаунта и безопасностью
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="space-y-6">
          {/* Раздел настроек сессии */}
          <div className="bg-zinc-800/50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Сессия</h3>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-5">
              <h4 className="text-red-400 font-medium mb-2">Выход из аккаунта</h4>
              <p className="text-zinc-400 text-sm mb-4">
                Выйти из своего аккаунта на всех устройствах. Это приведет к завершению текущей сессии.
              </p>
              <LogoutButton />
            </div>
          </div>
          
          {/* Раздел удаления аккаунта (пока неактивен) */}
          <div className="bg-zinc-800/50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Удаление аккаунта</h3>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-5">
              <h4 className="text-red-400 font-medium mb-2">Удалить аккаунт</h4>
              <p className="text-zinc-400 text-sm mb-4">
                Удаление аккаунта приведет к потере всех данных и не может быть отменено.
              </p>
              <button
                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500/50 rounded-md cursor-not-allowed opacity-70"
                disabled
              >
                <span>Удалить аккаунт</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 