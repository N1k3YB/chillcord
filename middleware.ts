import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

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
  
  return NextResponse.next();
} 