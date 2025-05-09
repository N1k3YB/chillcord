"use client";

import { useSession } from "next-auth/react";

export const ServerSidebar = () => {
  const { data: session } = useSession();
  
  return (
    <div className="h-full w-60 z-20 flex flex-col bg-zinc-700 py-3 text-zinc-200">
      <div className="px-3">
        <div className="flex items-center h-12 mb-2">
          <h2 className="text-lg font-bold">ChillCord</h2>
        </div>
        
        <div className="mt-2">
          <div className="font-medium">
            <div className="flex items-center py-2 px-2 rounded mb-1 hover:bg-zinc-600/50 cursor-pointer">
              Общий канал
            </div>
          </div>
        </div>
      </div>
      
      {/* Информация о пользователе внизу */}
      <div className="mt-auto p-3 bg-zinc-800">
        <div className="flex items-center gap-2">
          <div className="font-medium truncate">
            <div className="truncate">{session?.user?.name || "Пользователь"}</div>
            <p className="text-xs text-zinc-400">
              С нами с недавно
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 