"use client";

import { Sidebar } from "@/components/navigation/Sidebar";
import { ServerSidebar } from "@/components/navigation/ServerSidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLastRouteStore } from "@/lib/stores/last-route-store";
import axios from "@/lib/axios";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export const ChatLayout = ({ children }: ChatLayoutProps) => {
  const pathname = usePathname();
  const { setLastChatRoute } = useLastRouteStore();
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Сохраняем текущий путь при каждом изменении маршрута
  useEffect(() => {
    if (pathname.startsWith('/chats')) {
      setLastChatRoute(pathname);
    }
  }, [pathname, setLastChatRoute]);
  
  // Глобальный обработчик для события выхода из канала
  useEffect(() => {
    const handleChannelLeft = async (event: CustomEvent<{ channelId: string }>) => {
      // Форсируем обновление компонентов
      setForceUpdate(prev => prev + 1);
      
      console.log("Глобальный обработчик: пользователь вышел из канала:", event.detail.channelId);
      
      // Сразу очищаем URL, если он содержит ID канала, из которого вышли
      if (pathname.includes(event.detail.channelId)) {
        console.log("URL содержит ID канала, из которого вышли - перенаправляем");
        
        // Заменяем текущую запись в истории вместо добавления новой
        // Это предотвратит возможность вернуться к несуществующему каналу
        window.history.replaceState({}, "", "/chats");
        
        // Принудительно обновляем страницу, чтобы избежать проблем с состоянием
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    };
    
    window.addEventListener("channel-left" as any, handleChannelLeft);
    
    return () => {
      window.removeEventListener("channel-left" as any, handleChannelLeft);
    };
  }, [pathname]);
  
  return (
    <div className="h-full">
      <div className="fixed inset-y-0 flex h-full w-full">
        <Sidebar key={`sidebar-${forceUpdate}`} />
        <ServerSidebar key={`server-sidebar-${forceUpdate}`} />
        <main className="h-full flex-1 bg-zinc-900 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}; 