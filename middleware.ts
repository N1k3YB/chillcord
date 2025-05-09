import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Проверяем, находится ли пользователь на защищенном маршруте
  const isProtected = pathname.startsWith("/dashboard");
  
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // Если пользователь не аутентифицирован и пытается зайти на защищенный маршрут
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  // Если пользователь уже аутентифицирован и пытается зайти на страницу авторизации
  if (pathname === "/" && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
} 