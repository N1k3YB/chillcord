"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Settings, User, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Sidebar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const handleProfileClick = () => {
    router.push("/profile");
  };
  
  const handleSettingsClick = () => {
    router.push("/profile/settings");
  };

  const joinDate = new Date().toLocaleDateString('ru-RU', { 
    year: 'numeric', 
    month: 'short',
    day: 'numeric'
  });

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  return (
    <div 
      className={cn(
        "h-full z-30 flex flex-col items-center py-3 bg-zinc-800 border-r border-zinc-700 transition-all duration-300 ease-in-out overflow-hidden",
        expanded ? "w-60" : "w-[72px]"
      )}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="w-full flex flex-col items-center">
        {/* Логотип и toggle */}
        <div className="flex items-center justify-between w-full px-3 mb-4">
          <div
            className="h-12 w-12 rounded-full bg-zinc-700 flex items-center justify-center cursor-pointer hover:bg-indigo-500 transition"
            onClick={() => router.push("/chats")}
          >
            <span className="text-white text-xl font-bold">CC</span>
          </div>
          
          {expanded && (
            <button 
              onClick={toggleSidebar} 
              className="text-zinc-400 hover:text-white"
            >
              <ChevronRight className="h-5 w-5 transition-transform" />
            </button>
          )}
        </div>

        {/* Разделитель */}
        <div className="h-[2px] w-10 bg-zinc-700 rounded-full mb-4" />
      </div>

      {/* Мини-профиль внизу */}
      <div className="mt-auto w-full">
        <div 
          className={cn(
            "flex items-center gap-3 p-3 hover:bg-zinc-750 transition-colors border-t border-zinc-700 cursor-pointer",
            expanded ? "justify-between" : "justify-center"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="h-10 w-10 rounded-full overflow-hidden bg-zinc-700 flex-shrink-0"
              onClick={handleProfileClick}
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-6 w-6 text-zinc-400" />
                </div>
              )}
            </div>
            
            {expanded && (
              <div className="flex-1 min-w-0" onClick={handleProfileClick}>
                <div className="font-semibold truncate text-white hover:underline">
                  {session?.user?.name || "Пользователь"}
                </div>
                <p className="text-xs text-zinc-400 truncate">
                  С нами с {joinDate}
                </p>
              </div>
            )}
          </div>
          
          {expanded && (
            <div className="flex gap-1">
              <button 
                onClick={handleSettingsClick}
                className="p-1 hover:bg-zinc-600 rounded-full transition-colors"
                title="Настройки"
              >
                <Settings className="h-4 w-4 text-zinc-400 hover:text-white" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 