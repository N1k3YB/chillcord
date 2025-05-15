import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Server } from 'socket.io';

// Переменная для хранения Socket.IO сервера
let io: Server | null = null;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtected = pathname.startsWith("/chats");
  
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/chats", request.url));
  }
  
  // Пропускаем запросы к Socket.IO
  if (pathname.startsWith('/api/socket-io') || pathname.startsWith('/socket.io')) {
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

// Параметры для middleware
export const config = {
  matcher: [
    // Применяем middleware только к API-маршрутам и Socket.IO
    '/api/:path*',
    '/socket.io/:path*',
  ],
};

// Нам нужно настроить Socket.IO сервер отдельно,
// так как в middleware нет доступа к HTTP серверу Next.js
// Это будет сделано при запуске сервера с помощью custom server 