'use client';

import { useSession, signOut } from 'next-auth/react';
import Button from './components/ui/Button';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Если пользователь не аутентифицирован, перенаправляем на страницу входа
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8">ChillCord</h1>
      
      {status === 'loading' && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8 w-full max-w-md shadow-lg border border-gray-700">
          <p className="text-center">Загрузка...</p>
        </div>
      )}
      
      {session?.user && (
        <div className="bg-gray-800 rounded-lg p-6 mb-8 w-full max-w-md shadow-lg border border-gray-700">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-xl font-bold">
              {session.user.name?.[0] || '?'}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{session.user.name}</h2>
              <p className="text-gray-400">{session.user.email}</p>
            </div>
          </div>
          
          <p className="text-gray-300 mb-6">
            Добро пожаловать в ChillCord! Скоро здесь появится больше функций.
          </p>
          
          <Button 
            danger 
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            Выйти
          </Button>
        </div>
      )}
      
      <div className="text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} ChillCord. Все права защищены.
      </div>
    </div>
  );
}
