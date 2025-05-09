"use client";

import { User, Bell, Eye, Brush, Settings, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLastRouteStore } from "@/lib/stores/last-route-store";

export const ProfileSidebar = () => {
  const pathname = usePathname();
  const { lastChatRoute } = useLastRouteStore();

  const routes = [
    {
      icon: User,
      label: "Аккаунт",
      href: "/profile",
      active: pathname === "/profile",
    },
    {
      icon: Bell,
      label: "Уведомления",
      href: "/profile/notifications",
      active: pathname === "/profile/notifications",
    },
    {
      icon: Eye,
      label: "Конфиденциальность",
      href: "/profile/privacy",
      active: pathname === "/profile/privacy",
    },
    {
      icon: Brush,
      label: "Внешний вид",
      href: "/profile/appearance",
      active: pathname === "/profile/appearance",
    },
    {
      icon: Settings,
      label: "Настройки",
      href: "/profile/settings",
      active: pathname === "/profile/settings",
    }
  ];

  return (
    <div className="w-60 flex-shrink-0 h-full bg-zinc-800 border-r border-zinc-700 py-3 flex flex-col">
      <div className="px-4 mb-2">
        <h2 className="text-xl font-bold text-indigo-400">Мой профиль</h2>
      </div>
      <div className="space-y-1 px-2 flex-1">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-x-2 text-zinc-300 text-sm font-medium px-3 py-2 rounded-md transition-colors hover:bg-zinc-700/30 hover:text-white",
              route.active && "bg-zinc-700/50 text-white"
            )}
          >
            <route.icon className={cn("h-5 w-5", route.active && "text-indigo-400")} />
            {route.label}
          </Link>
        ))}
      </div>
      <div className="mt-auto px-2 pb-3 pt-2 border-t border-zinc-700">
        <Link
          href={lastChatRoute}
          className="flex items-center gap-x-2 text-zinc-300 text-sm font-medium px-3 py-2 rounded-md transition-colors hover:bg-zinc-700/30 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
          Назад к чатам
        </Link>
      </div>
    </div>
  );
}; 