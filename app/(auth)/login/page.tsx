'use client';

import React, { useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';
import AuthSidebar from '@/app/components/auth/AuthSidebar';

const LoginPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    email: '',
    password: ''
  });

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formValues.email,
        password: formValues.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Ошибка входа:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formValues, router]);

  return (
    <>
      <AuthSidebar />
      
      <div className="flex flex-1 flex-col justify-center bg-[#36393F] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">С возвращением!</h2>
            <p className="text-gray-400">Мы так рады видеть вас снова!</p>
          </div>
          
          <div className="bg-[#2F3136] p-8 rounded-md shadow-lg border border-gray-700">
            <form className="space-y-6" onSubmit={onSubmit}>
              <div>
                <Input
                  id="email"
                  label="EMAIL ИЛИ НОМЕР ТЕЛЕФОНА"
                  type="email"
                  required
                  value={formValues.email}
                  onChange={(e) => setFormValues(prev => ({ ...prev, email: e.target.value }))}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Input
                  id="password"
                  label="ПАРОЛЬ"
                  type="password"
                  required
                  value={formValues.password}
                  onChange={(e) => setFormValues(prev => ({ ...prev, password: e.target.value }))}
                  disabled={isLoading}
                />
              </div>

              <div className="text-left">
                <a href="#" className="text-sm text-[#5865F2] hover:underline">
                  Забыли пароль?
                </a>
              </div>

              <div>
                <Button type="submit" fullWidth disabled={isLoading}>
                  Войти
                </Button>
              </div>
              
              <div className="text-sm text-gray-400 mt-2">
                <span>Нужен аккаунт? </span>
                <Link href="/register" className="text-[#5865F2] hover:underline">
                  Зарегистрироваться
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage; 