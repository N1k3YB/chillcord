"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  role: string;
}

export default function ChannelPage() {
  const params = useParams();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const channelId = params?.channelId as string;
  
  useEffect(() => {
    const fetchChannelDetails = async () => {
      if (!channelId) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/channels/${channelId}`);
        setChannel(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке деталей канала:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChannelDetails();
  }, [channelId]);
  
  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-zinc-400">Загрузка канала...</p>
      </div>
    );
  }
  
  if (!channel) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-zinc-400">Канал не найден</p>
      </div>
    );
  }
  
  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">{channel.name}</h1>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-3xl w-full px-4">
          {channel.description && (
            <div className="mb-8 p-6 bg-zinc-800/50 rounded-lg border border-zinc-700 shadow-lg">
              <h2 className="text-xl font-semibold text-white mb-4">Описание канала</h2>
              <p className="text-zinc-200 text-lg leading-relaxed">{channel.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 