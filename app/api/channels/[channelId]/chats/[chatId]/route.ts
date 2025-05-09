import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Получение информации о чате
export async function GET(
  req: Request,
  { params }: { params: { channelId: string; chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { channelId, chatId } = params;
    
    if (!channelId || !chatId) {
      return new NextResponse("Необходимы Channel ID и Chat ID", { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Проверяем, является ли пользователь участником канала
    const membership = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: user.id,
          channelId,
        },
      },
    });
    
    if (!membership) {
      return new NextResponse("Доступ запрещен", { status: 403 });
    }
    
    // Получаем информацию о чате
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        channelId,
      },
    });
    
    if (!chat) {
      return new NextResponse("Чат не найден", { status: 404 });
    }
    
    return NextResponse.json(chat);
  } catch (error) {
    console.error("[CHAT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 