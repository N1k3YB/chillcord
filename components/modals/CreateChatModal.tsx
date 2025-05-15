"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Hash, MessageSquare, X } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
}

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Имя чата обязательно",
  }),
  description: z.string().optional(),
  type: z.enum(["TEXT"]),
});

type FormValues = z.infer<typeof formSchema>;

export const CreateChatModal = ({
  isOpen,
  onClose,
  channelId,
}: CreateChatModalProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "TEXT",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(`/api/channels/${channelId}/chats`, values);
      
      // Отправляем событие о создании нового чата для обновления сайдбара
      const newChatEvent = new CustomEvent("chat-created", {
        detail: {
          channelId,
          chat: response.data
        }
      });
      window.dispatchEvent(newChatEvent);
      
      reset();
      onClose();
      
      // Перенаправить в новый чат
      router.push(`/chats/channels/${channelId}/chats/${response.data.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-zinc-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title as="h3" className="text-lg font-medium text-white">
                    Создать новый чат
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-zinc-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Название чата
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Hash className="h-5 w-5 text-zinc-400" />
                      </div>
                      <input
                        {...register("name")}
                        disabled={isLoading}
                        className="w-full pl-10 px-3 py-2 bg-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="название-чата"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">
                      Описание (необязательно)
                    </label>
                    <textarea
                      {...register("description")}
                      disabled={isLoading}
                      className="w-full px-3 py-2 bg-zinc-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Введите описание чата"
                      rows={3}
                    />
                  </div>

                  <div className="pt-2">
                    <p className="text-sm font-medium text-zinc-300 mb-2">
                      Тип чата
                    </p>
                    <div className="bg-zinc-700 rounded-md p-3">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-indigo-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Текстовый чат</p>
                          <p className="text-xs text-zinc-400">Отправляйте сообщения, изображения и файлы</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white mr-2"
                    >
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? "Создание..." : "Создать чат"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 