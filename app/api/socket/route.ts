import { NextResponse } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export async function GET(req: Request) {
  try {
    // В Next.js App Router нам нужно инициализировать сокет-сервер иначе
    // Это заглушка для будущей инициализации, которая может происходить в middleware
    return new NextResponse('Socket server ready', { status: 200 });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 