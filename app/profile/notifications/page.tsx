"use client";

import { Bell, MessageSquare, AtSign, UserPlus } from "lucide-react";
import { TabHeader } from "@/components/profile/TabHeader";
import { TabContent } from "@/components/profile/TabContent";

export default function NotificationsPage() {
  return (
    <div className="p-8">
      <TabHeader 
        title="Уведомления" 
        description="Настройте, как и когда вы хотите получать уведомления"
        icon={Bell}
      />
      
      <TabContent>
        <div className="max-w-3xl mx-auto">
          {/* Общие настройки уведомлений */}
          <div className="bg-zinc-800/50 p-6 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-indigo-400" />
              <h3 className="text-lg font-medium text-white">Общие настройки</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium mb-1">Включить уведомления</h4>
                  <p className="text-zinc-400 text-sm">
                    Получать уведомления о новых событиях
                  </p>
                </div>
                <div className="relative inline-block w-10 h-5">
                  <input
                    id="notifications-toggle"
                    type="checkbox"
                    className="opacity-0 w-0 h-0"
                    defaultChecked
                  />
                  <label
                    htmlFor="notifications-toggle"
                    className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-zinc-700 rounded-full transition hover:bg-zinc-600"
                  >
                    <span className="absolute left-[18px] top-1 bg-indigo-500 w-3 h-3 rounded-full transition-transform" />
                  </label>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-medium mb-1">Звук уведомлений</h4>
                  <p className="text-zinc-400 text-sm">
                    Воспроизводить звук при получении уведомления
                  </p>
                </div>
                <div className="relative inline-block w-10 h-5">
                  <input
                    id="sound-toggle"
                    type="checkbox"
                    className="opacity-0 w-0 h-0"
                    defaultChecked
                  />
                  <label
                    htmlFor="sound-toggle"
                    className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-zinc-700 rounded-full transition hover:bg-zinc-600"
                  >
                    <span className="absolute left-[18px] top-1 bg-indigo-500 w-3 h-3 rounded-full transition-transform" />
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Типы уведомлений */}
          <div className="bg-zinc-800/50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-4">Типы уведомлений</h3>
            
            <div className="space-y-4">
              <div className="p-4 rounded-md bg-zinc-800 border border-zinc-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-indigo-400" />
                    <h4 className="text-white font-medium">Сообщения</h4>
                  </div>
                  <select className="bg-zinc-700 text-white text-sm rounded px-2 py-1 border border-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option>Все сообщения</option>
                    <option>Только упоминания</option>
                    <option>Выключены</option>
                  </select>
                </div>
              </div>
              
              <div className="p-4 rounded-md bg-zinc-800 border border-zinc-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <AtSign className="h-5 w-5 text-indigo-400" />
                    <h4 className="text-white font-medium">Упоминания</h4>
                  </div>
                  <select className="bg-zinc-700 text-white text-sm rounded px-2 py-1 border border-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option>Всегда</option>
                    <option>Никогда</option>
                  </select>
                </div>
              </div>
              
              <div className="p-4 rounded-md bg-zinc-800 border border-zinc-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <UserPlus className="h-5 w-5 text-indigo-400" />
                    <h4 className="text-white font-medium">Запросы в друзья</h4>
                  </div>
                  <select className="bg-zinc-700 text-white text-sm rounded px-2 py-1 border border-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option>Всегда</option>
                    <option>Никогда</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabContent>
    </div>
  );
} 