"use client";

import { ProfileSidebar } from "@/components/profile/ProfileSidebar";

interface ProfileLayoutProps {
  children: React.ReactNode;
}

export const ProfileLayout = ({ children }: ProfileLayoutProps) => {
  return (
    <div className="h-full bg-zinc-900">
      <div className="fixed inset-y-0 flex h-full w-full">
        <main className="h-full flex-1 bg-zinc-900 overflow-y-auto">
          <div className="h-full flex">
            <ProfileSidebar />
            <div className="flex-1 overflow-y-auto bg-zinc-900">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}; 