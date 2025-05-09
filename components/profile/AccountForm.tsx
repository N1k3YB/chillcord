"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { User, Save, Upload } from "lucide-react";
import Image from "next/image";

type AccountFormValues = {
  name: string;
  email: string;
};

export const AccountForm = () => {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountFormValues>({
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    },
  });

  const onSubmit = async (data: AccountFormValues) => {
    try {
      setIsLoading(true);
      setIsSaved(false);
      
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
        },
      });
      
      setIsSaved(true);
      
      // Показать сообщение об успехе только на 3 секунды
      setTimeout(() => {
        setIsSaved(false);
      }, 3000);
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Аватар пользователя */}
        <div className="bg-zinc-800/50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Аватар</h3>
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Avatar"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-10 w-10 text-zinc-400" />
              )}
            </div>
            <div>
              <button
                type="button"
                className="flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                <Upload className="h-4 w-4" />
                <span>Загрузить изображение</span>
              </button>
              <p className="text-xs text-zinc-400 mt-2">
                Рекомендуемый размер: 800x800 пикселей (макс. 5 МБ)
              </p>
            </div>
          </div>
        </div>

        {/* Информация профиля */}
        <div className="bg-zinc-800/50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-4">Информация профиля</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Имя пользователя
              </label>
              <input
                {...register("name", { required: "Имя обязательно" })}
                className="w-full rounded-md bg-zinc-700/50 border border-zinc-600 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Ваше имя"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">
                Email
              </label>
              <input
                {...register("email")}
                disabled
                className="w-full rounded-md bg-zinc-700/50 border border-zinc-600 px-3 py-2 text-zinc-400 opacity-70 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-zinc-500">Email нельзя изменить</p>
            </div>
          </div>
        </div>

        {/* Кнопка сохранения */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 rounded-md bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700 disabled:opacity-70 transition"
          >
            {isLoading ? (
              <span>Сохранение...</span>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Сохранить изменения</span>
              </>
            )}
          </button>
        </div>
        
        {/* Сообщение об успешном сохранении */}
        {isSaved && (
          <div className="fixed bottom-5 right-5 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center gap-2 animate-slide-up">
            <div className="h-2 w-2 rounded-full bg-white"></div>
            <p>Изменения успешно сохранены</p>
          </div>
        )}
      </form>
    </div>
  );
}; 