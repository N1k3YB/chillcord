"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Settings, User } from "lucide-react";

export const Sidebar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleProfileClick = () => {
    router.push("/dashboard/profile");
  };

  return (
    <div className="h-full w-[72px] z-30 flex flex-col items-center bg-zinc-800 py-3">
      <div className="flex flex-col items-center space-y-4">
        {/* Логотип */}
        <div
          className="h-12 w-12 rounded-full bg-zinc-700 flex items-center justify-center cursor-pointer hover:bg-indigo-500 transition"
          onClick={() => router.push("/dashboard")}
        >
          <span className="text-white text-xl font-bold">CC</span>
        </div>

        {/* Разделитель */}
        <div className="h-[2px] w-10 bg-zinc-700 rounded-full" />

        {/* Кнопка профиля (внизу) */}
        <div className="absolute bottom-4 flex flex-col items-center space-y-4">
          <div
            className="group flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-zinc-700 hover:bg-zinc-600 transition"
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
              <User className="text-zinc-400 group-hover:text-white transition" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 