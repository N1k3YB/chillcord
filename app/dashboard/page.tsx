"use client";

import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4 px-4">
      <h1 className="text-4xl font-bold text-white">
        Добро пожаловать, {session?.user?.name || "пользователь"}!
      </h1>
      <p className="text-xl text-zinc-400 text-center max-w-md">
        Это ваша главная страница ChillCord. Здесь будут отображаться ваши каналы и сообщения.
      </p>
    </div>
  );
} 