import { NextRequest, NextResponse } from 'next/server';

// Обработчик для GET запросов к /api/socket-io
export async function GET(req: NextRequest) {
  try {
    // В App Router мы не можем напрямую получить HTTP-сервер
    // Socket.IO подключается через middleware
    return NextResponse.json({ status: 'Socket.IO endpoint ready' });
  } catch (error) {
    console.error('[SOCKET_IO_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Обработчик OPTIONS для CORS предварительных запросов
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 