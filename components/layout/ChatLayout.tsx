"use client";

import { Sidebar } from "@/components/navigation/Sidebar";
import { ServerSidebar } from "@/components/navigation/ServerSidebar";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export const ChatLayout = ({ children }: ChatLayoutProps) => {
  return (
    <div className="h-full">
      <div className="fixed inset-y-0 flex h-full w-full">
        <Sidebar />
        <ServerSidebar />
        <main className="h-full flex-1 bg-zinc-900 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}; 