"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLastRouteStore } from "@/lib/stores/last-route-store";

export const RouteTracker = () => {
  const pathname = usePathname();
  const { setLastChatRoute } = useLastRouteStore();
  
  // Дополнительная проверка для сохранения маршрутов чатов
  useEffect(() => {
    const handleRouteChange = () => {
      if (pathname.startsWith('/chats')) {
        // Сохраняем маршрут чатов в хранилище
        setLastChatRoute(pathname);
      }
    };
    
    // Вызываем обработчик при первом рендере
    handleRouteChange();
    
    // Это не совсем верный способ для Next.js, но он будет работать как запасной вариант
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [pathname, setLastChatRoute]);
  
  return null; // Компонент ничего не рендерит в DOM
}; 