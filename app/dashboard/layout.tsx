"use client";

import { ChatLayout } from "@/components/layout/ChatLayout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-900">
        <div className="text-xl text-white">Загрузка...</div>
      </div>
    );
  }

  return <ChatLayout>{children}</ChatLayout>;
} 