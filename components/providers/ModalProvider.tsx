"use client";

import { useState, useEffect } from "react";
import { CreateChannelModal } from "@/components/modals/CreateChannelModal";
import { CreateChatModal } from "@/components/modals/CreateChatModal";

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);
  const [isCreateChatModalOpen, setIsCreateChatModalOpen] = useState(false);
  const [activeChannelId, setActiveChannelId] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Функция для установки глобальных обработчиков событий
  useEffect(() => {
    if (isMounted) {
      const handleCreateChannel = (e: CustomEvent) => {
        setIsCreateChannelModalOpen(true);
      };

      const handleCreateChat = (e: CustomEvent<{ channelId: string }>) => {
        setActiveChannelId(e.detail.channelId);
        setIsCreateChatModalOpen(true);
      };

      // Добавляем слушателей для событий
      window.addEventListener("open-create-channel-modal" as any, handleCreateChannel);
      window.addEventListener("open-create-chat-modal" as any, handleCreateChat);

      // Очистка слушателей при размонтировании
      return () => {
        window.removeEventListener("open-create-channel-modal" as any, handleCreateChannel);
        window.removeEventListener("open-create-chat-modal" as any, handleCreateChat);
      };
    }
  }, [isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateChannelModal
        isOpen={isCreateChannelModalOpen}
        onClose={() => setIsCreateChannelModalOpen(false)}
      />
      <CreateChatModal
        isOpen={isCreateChatModalOpen}
        onClose={() => setIsCreateChatModalOpen(false)}
        channelId={activeChannelId}
      />
    </>
  );
}; 