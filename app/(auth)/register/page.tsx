'use client';

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Input from '@/app/components/ui/Input';
import Button from '@/app/components/ui/Button';
import Link from 'next/link';
import AuthSidebar from '@/app/components/auth/AuthSidebar';

const RegisterPage = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: ''
  });

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Регистрация пользователя
      await axios.post('/api/register', formValues);

      // Автоматический вход после регистрации
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
      console.error('Ошибка регистрации:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formValues, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <AuthSidebar />
      
      <div className="flex flex-1 flex-col justify-center bg-[#36393F] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Создать аккаунт</h2>
          </div>
          
          <div className="bg-[#2F3136] p-8 rounded-md shadow-lg border border-gray-700">
            <form className="space-y-6" onSubmit={onSubmit}>
              <div>
                <Input
                  id="name"
                  label="ИМЯ ПОЛЬЗОВАТЕЛЯ"
                  type="text"
                  required
                  value={formValues.name}
                  onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Input
                  id="email"
                  label="EMAIL"
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

              <div>
                <Button type="submit" fullWidth disabled={isLoading}>
                  Регистрация
                </Button>
              </div>
              
              <div className="text-sm text-gray-400 mt-2">
                <Link href="/login" className="text-[#5865F2] hover:underline">
                  Уже есть аккаунт?
                </Link>
              </div>
            </form>
          </div>
          
          <div className="mt-4 text-center text-xs text-gray-400">
            Регистрируясь, вы соглашаетесь с Условиями использования<br />
            и Политикой конфиденциальности.
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage; 