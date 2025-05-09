"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LogOut, User, Save } from "lucide-react";

type ProfileFormValues = {
  name: string;
  email: string;
};

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      setIsSaved(false);
      
      // В реальном приложении здесь был бы API запрос для обновления данных пользователя
      // Сейчас просто обновим сессию для демонстрации
      await update({
        ...session,
        user: {
          ...session?.user,
          name: data.name,
        },
      });
      
      setIsSaved(true);
    } catch (error) {
      console.error("Ошибка при обновлении профиля:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="h-full p-8">
      <div className="mx-auto max-w-md">
        <div className="mb-8 flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-zinc-700 flex items-center justify-center">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt="Avatar" 
                className="h-14 w-14 rounded-full" 
              />
            ) : (
              <User className="h-8 w-8 text-zinc-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{session?.user?.name || "Пользователь"}</h1>
            <p className="text-zinc-400">{session?.user?.email}</p>
          </div>
        </div>

        <div className="rounded-lg bg-zinc-800 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Настройки профиля</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Имя пользователя
              </label>
              <input
                {...register("name", { required: "Имя обязательно" })}
                className="w-full rounded-md bg-zinc-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Email
              </label>
              <input
                {...register("email")}
                disabled
                className="w-full rounded-md bg-zinc-700 px-3 py-2 text-white opacity-70 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-zinc-500">Email нельзя изменить</p>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center space-x-2 rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти</span>
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-70"
              >
                {isLoading ? (
                  <span>Сохранение...</span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Сохранить</span>
                  </>
                )}
              </button>
            </div>
            
            {isSaved && (
              <p className="text-center text-sm text-green-500">Профиль успешно обновлен!</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 