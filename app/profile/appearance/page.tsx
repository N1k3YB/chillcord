"use client";

import { Moon, Sun } from "lucide-react";

export default function AppearancePage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Внешний вид</h1>
        <p className="text-zinc-400 mt-1">
          Настройте внешний вид интерфейса ChillCord
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        {/* Выбор темы */}
        <div className="bg-zinc-800/50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-medium text-white mb-4">Тема</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Темная тема */}
            <div className="bg-zinc-800 border-2 border-indigo-500 rounded-lg p-4 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">Темная</span>
                </div>
                <div className="h-4 w-4 rounded-full bg-indigo-500"></div>
              </div>
              <div className="h-32 rounded-md bg-zinc-900 border border-zinc-700">
                <div className="h-6 w-full bg-zinc-800 border-b border-zinc-700"></div>
                <div className="flex h-[calc(100%-24px)]">
                  <div className="w-10 bg-zinc-800 border-r border-zinc-700"></div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-16 h-3 bg-zinc-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Светлая тема (пока недоступна) */}
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 opacity-50 cursor-not-allowed">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">Светлая</span>
                </div>
                <div className="h-4 w-4 rounded-full bg-zinc-600"></div>
              </div>
              <div className="h-32 rounded-md bg-zinc-100 border border-zinc-300">
                <div className="h-6 w-full bg-white border-b border-zinc-300"></div>
                <div className="flex h-[calc(100%-24px)]">
                  <div className="w-10 bg-white border-r border-zinc-300"></div>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-16 h-3 bg-zinc-300 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20">
                <div className="bg-zinc-800 text-white text-sm px-2 py-1 rounded">
                  Скоро
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Размер шрифта */}
        <div className="bg-zinc-800/50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Размер шрифта</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Размер шрифта сообщений</span>
              <div className="flex items-center bg-zinc-700 rounded-md overflow-hidden">
                <button className="px-3 py-1 text-white text-sm bg-indigo-600">14px</button>
                <button className="px-3 py-1 text-zinc-400 text-sm hover:bg-zinc-600/50">16px</button>
                <button className="px-3 py-1 text-zinc-400 text-sm hover:bg-zinc-600/50">18px</button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Масштаб интерфейса</span>
              <div className="w-48 h-2 bg-zinc-700 rounded-full relative">
                <div className="absolute left-0 top-0 h-2 w-1/3 bg-indigo-500 rounded-full"></div>
                <div className="absolute left-1/3 top-0 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 bg-white rounded-full border-2 border-indigo-500 cursor-pointer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 