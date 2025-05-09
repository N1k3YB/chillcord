"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Users, Info, ArrowRight, Shield, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const inviteCode = params?.code as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channelInfo, setChannelInfo] = useState<{ 
    channelId: string;
    channelName: string;
    channelDescription: string | null;
    isPublic: boolean;
  } | null>(null);
  
  // Перенаправляем на страницу авторизации, если пользователь не авторизован
  useEffect(() => {
    if (status === "unauthenticated" && inviteCode) {
      router.push(`/?callbackUrl=/invite/${inviteCode}`);
    }
  }, [status, inviteCode, router]);
  
  useEffect(() => {
    const fetchInviteInfo = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/invites/${inviteCode}`);
        setChannelInfo(response.data);
        setError(null);
      } catch (error: any) {
        console.error("Ошибка при получении информации о приглашении:", error);
        setError(error.response?.data || "Ошибка при получении данных о приглашении");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (inviteCode && status === "authenticated") {
      fetchInviteInfo();
    }
  }, [inviteCode, status]);
  
  const handleJoinChannel = async () => {
    if (!session) {
      // Перенаправляем на страницу авторизации, если пользователь не аутентифицирован
      router.push(`/?callbackUrl=/invite/${inviteCode}`);
      return;
    }
    
    try {
      setIsJoining(true);
      const response = await axios.post(`/api/invites/${inviteCode}`);
      
      // Показываем уведомление об успешном присоединении
      toast.success(`Вы присоединились к каналу ${channelInfo?.channelName}`);
      
      // Перенаправляем на страницу канала после успешного присоединения
      router.push(`/chats/channels/${response.data.id}`);
    } catch (error: any) {
      console.error("Ошибка при присоединении к каналу:", error);
      setError(error.response?.data || "Не удалось присоединиться к каналу");
      setIsJoining(false);
    }
  };
  
  // Показываем загрузку для авторизованных пользователей
  if (status === "loading" || (isLoading && status === "authenticated")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 p-6">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent mb-4"></div>
        <p className="text-zinc-400">Загрузка информации о приглашении...</p>
      </div>
    );
  }
  
  // Для неавторизованных пользователей перенаправление происходит в useEffect,
  // но на всякий случай показываем заглушку на время перенаправления
  if (status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 p-6">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-500 rounded-full border-t-transparent mb-4"></div>
        <p className="text-zinc-400">Перенаправление на страницу авторизации...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 p-6">
        <div className="w-full max-w-md p-6 bg-zinc-800 rounded-lg shadow-lg text-center">
          <Info className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Ошибка</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => router.push("/chats")}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            Вернуться в чаты
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 p-6">
      <div className="w-full max-w-md p-6 bg-zinc-800 rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <Users className="h-16 w-16 text-indigo-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Приглашение в канал</h1>
          <p className="text-zinc-400">
            Вас приглашают присоединиться к каналу в ChillCord
          </p>
        </div>
        
        {channelInfo && (
          <div className="bg-zinc-700/30 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">
              {channelInfo.channelName}
            </h2>
            {channelInfo.channelDescription && (
              <p className="text-zinc-300 text-sm mb-3">
                {channelInfo.channelDescription}
              </p>
            )}
            <div className="flex items-center text-xs text-zinc-400">
              <Shield className="h-4 w-4 mr-1" />
              {channelInfo.isPublic ? "Публичный канал" : "Приватный канал"}
            </div>
          </div>
        )}
        
        <div className="text-center">
          <button
            onClick={handleJoinChannel}
            disabled={isJoining}
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isJoining ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Присоединение...
              </>
            ) : (
              <>
                Присоединиться к каналу
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 