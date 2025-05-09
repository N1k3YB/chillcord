import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Константы для путей и куки аутентификации
const PUBLIC_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Проверяем наличие сессии через куки next-auth.session-token или authjs.session-token
  const authCookie = request.cookies.get('next-auth.session-token') || 
                     request.cookies.get('__Secure-next-auth.session-token') ||
                     request.cookies.get('authjs.session-token') ||
                     request.cookies.get('__Secure-authjs.session-token');
  
  const isAuthenticated = !!authCookie;
  const isPublicPath = PUBLIC_PATHS.some(path => pathname.startsWith(path));
  
  // 1. Аутентифицированные пользователи не должны иметь доступ к страницам логина и регистрации
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // 2. Неаутентифицированные пользователи должны быть перенаправлены на страницу логина
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

// Применяем middleware только к релевантным путям, исключая статические ресурсы
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 