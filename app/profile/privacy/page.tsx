"use client";

import { Shield, Lock } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Конфиденциальность</h1>
        <p className="text-zinc-400 mt-1">
          Управление настройками безопасности и конфиденциальности
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        {/* Настройки пароля */}
        <div className="bg-zinc-800/50 p-6 rounded-lg mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Пароль и аутентификация</h3>
          </div>
          
          <div className="space-y-6">
            <div className="border-b border-zinc-700 pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium mb-1">Изменить пароль</h4>
                  <p className="text-zinc-400 text-sm">
                    Рекомендуется менять пароль каждые 3 месяца для повышения безопасности
                  </p>
                </div>
                <button className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-sm rounded transition">
                  Изменить
                </button>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium mb-1">Двухфакторная аутентификация</h4>
                  <p className="text-zinc-400 text-sm">
                    Повысьте безопасность вашего аккаунта, требуя дополнительный код при входе
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="mr-2 text-zinc-400 text-sm">Выключено</div>
                  <div className="relative inline-block w-10 h-5">
                    <input
                      id="toggle"
                      type="checkbox"
                      className="opacity-0 w-0 h-0"
                      disabled
                    />
                    <label
                      htmlFor="toggle"
                      className="absolute cursor-not-allowed top-0 left-0 right-0 bottom-0 bg-zinc-700 rounded-full transition"
                    >
                      <span className="absolute left-1 top-1 bg-zinc-400 w-3 h-3 rounded-full transition-transform" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Настройки приватности */}
        <div className="bg-zinc-800/50 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Видимость профиля</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-white font-medium mb-1">Показывать статус онлайн</h4>
                <p className="text-zinc-400 text-sm">
                  Позволяет другим пользователям видеть, когда вы онлайн
                </p>
              </div>
              <div className="relative inline-block w-10 h-5">
                <input
                  id="status-toggle"
                  type="checkbox"
                  className="opacity-0 w-0 h-0"
                  defaultChecked
                />
                <label
                  htmlFor="status-toggle"
                  className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-zinc-700 rounded-full transition hover:bg-zinc-600"
                >
                  <span className="absolute left-[18px] top-1 bg-indigo-500 w-3 h-3 rounded-full transition-transform" />
                </label>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div>
                <h4 className="text-white font-medium mb-1">Кто может отправлять вам сообщения</h4>
              </div>
              <select className="bg-zinc-700 text-white text-sm rounded px-2 py-1 border border-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option>Все пользователи</option>
                <option>Только друзья</option>
                <option>Никто</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 