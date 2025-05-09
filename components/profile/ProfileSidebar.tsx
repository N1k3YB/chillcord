"use client";

import { User, Bell, Eye, Brush, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const ProfileSidebar = () => {
  const pathname = usePathname();

  const routes = [
    {
      icon: User,
      label: "Аккаунт",
      href: "/profile",
    },
    {
      icon: Bell,
      label: "Уведомления",
      href: "/profile/notifications",
    },
    {
      icon: Eye,
      label: "Конфиденциальность",
      href: "/profile/privacy",
    },
    {
      icon: Brush,
      label: "Внешний вид",
      href: "/profile/appearance",
    },
    {
      icon: Settings,
      label: "Настройки",
      href: "/profile/settings",
    }
  ];

  return (
    <div className="w-60 flex-shrink-0 h-full bg-zinc-800 border-r border-zinc-700 py-3 space-y-4">
      <div className="px-4">
        <h2 className="text-xl font-bold text-indigo-400">Мой профиль</h2>
      </div>
      <div className="space-y-1 px-2">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-x-2 text-zinc-300 text-sm font-medium px-3 py-2 rounded-md",
              pathname === route.href && "bg-zinc-700/50 text-white"
            )}
          >
            <route.icon className="h-5 w-5" />
            {route.label}
          </Link>
        ))}
      </div>
    </div>
  );
}; 