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
    </div>
  );
}; 