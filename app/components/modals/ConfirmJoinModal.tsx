"use client";

import { Check, X } from "lucide-react";

interface ConfirmJoinModalProps {
  channelName: string;
  isPublic: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmJoinModal = ({
  channelName,
  isPublic,
  onConfirm,
  onCancel
}: ConfirmJoinModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-zinc-800 rounded-lg w-full max-w-md p-6 mx-4 border border-zinc-700">
        <div className="text-center mb-6">
          <div className="h-16 w-16 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Присоединиться к каналу</h3>
          <p className="text-zinc-400">
            Вы хотите присоединиться к каналу <span className="font-medium text-white">{channelName}</span>?
          </p>
          
          <div className="mt-2">
            <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-zinc-700 text-zinc-300">
              {isPublic ? "Публичный канал" : "Приватный канал"}
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md transition-colors"
          >
            Присоединиться
          </button>
        </div>
      </div>
    </div>
  );
}; 