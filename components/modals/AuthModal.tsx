"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

export default function AuthModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl");
  
  const [isLoading, setIsLoading] = useState(false);
  const [variant, setVariant] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [showInviteMessage, setShowInviteMessage] = useState(false);
  
  // Проверяем, содержит ли URL параметр callbackUrl с приглашением
  useEffect(() => {
    if (callbackUrl && callbackUrl.includes("/invite/")) {
      setShowInviteMessage(true);
    }
  }, [callbackUrl]);

  const toggleVariant = useCallback(() => {
    setVariant((currentVariant) => 
      currentVariant === "LOGIN" ? "REGISTER" : "LOGIN"
    );
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    if (variant === "REGISTER") {
      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then(() => signIn("credentials", {
          ...data,
          redirect: false
        }))
        .then((callback) => {
          if (callback?.ok && !callback?.error) {
            toast.success("Регистрация успешна!");
            
            // Перенаправляем на страницу приглашения или в чаты
            if (callbackUrl) {
              router.push(callbackUrl);
            } else {
              router.push("/chats");
            }
          } else {
            toast.error("Что-то пошло не так!");
          }
        })
        .catch(() => toast.error("Что-то пошло не так!"))
        .finally(() => setIsLoading(false));
    }

    if (variant === "LOGIN") {
      signIn("credentials", {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error("Неверные учетные данные");
          }

          if (callback?.ok && !callback?.error) {
            toast.success("Вход выполнен!");
            
            // Перенаправляем на страницу приглашения или в чаты
            if (callbackUrl) {
              router.push(callbackUrl);
            } else {
              router.push("/chats");
            }
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  return (
    <div className="flex min-h-screen w-screen">
      {/* Левая сторона - анимация волны */}
      <div className="hidden lg:flex lg:flex-col lg:justify-center lg:items-center lg:w-[60%] bg-zinc-900">
        <h1 className="text-white text-5xl font-bold mb-10">ChillCord</h1>
        <div className="w-full h-32 relative overflow-hidden px-4">
          <div className="absolute w-full h-full flex items-center justify-between">
            {Array.from({ length: 40 }).map((_, i) => (
              <div 
                key={i}
                className="bg-indigo-500 w-1 md:w-2 rounded-full animate-wave"
                style={{ 
                  height: `${Math.sin(i / 3) * 50 + 50}%`,
                  animationDelay: `${i * 80}ms`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Правая сторона - форма аутентификации */}
      <div className="flex flex-col justify-center w-full lg:w-[40%] px-6 py-12 lg:px-8 bg-zinc-800">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-white">
            {variant === "LOGIN" ? "Вход в аккаунт" : "Регистрация аккаунта"}
          </h2>
          
          {/* Сообщение о приглашении */}
          {showInviteMessage && (
            <div className="mt-4 p-3 bg-indigo-900/50 rounded-md border border-indigo-700">
              <p className="text-sm text-center text-white">
                Для присоединения к каналу необходимо войти в аккаунт или зарегистрироваться
              </p>
            </div>
          )}
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {variant === "REGISTER" && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Имя
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    {...register("name", { required: true })}
                    type="text"
                    autoComplete="name"
                    disabled={isLoading}
                    className="block w-full rounded-md border-0 p-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-white"
              >
                Email
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  {...register("email", { required: true })}
                  type="email"
                  autoComplete="email"
                  disabled={isLoading}
                  className="block w-full rounded-md border-0 p-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-white"
                >
                  Пароль
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  {...register("password", { required: true })}
                  type="password"
                  autoComplete="current-password"
                  disabled={isLoading}
                  className="block w-full rounded-md border-0 p-1.5 text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <button
                disabled={isLoading}
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                {variant === "LOGIN" ? "Войти" : "Зарегистрироваться"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-zinc-800 px-2 text-gray-400">
                  Или
                </span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-400">
              {variant === "LOGIN"
                ? "Впервые используете ChillCord?"
                : "Уже есть аккаунт?"}
              <button
                onClick={toggleVariant}
                className="font-semibold leading-6 text-indigo-400 hover:text-indigo-300 ml-1"
              >
                {variant === "LOGIN" ? "Создать аккаунт" : "Войти"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 