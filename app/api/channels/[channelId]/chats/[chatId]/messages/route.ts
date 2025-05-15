import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Получение сообщений чата
export async function GET(
  req: Request,
  { params }: { params: { channelId: string; chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const paramsData = await params;
    const channelId = paramsData.channelId;
    const chatId = paramsData.chatId;
    
    // Проверка существования канала
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });
    
    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }
    
    // Проверка, является ли пользователь членом канала
    const member = await prisma.channelMember.findFirst({
      where: {
        channelId,
        user: {
          email: session.user.email,
        },
      },
    });
    
    if (!member) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    
    // Проверка существования чата
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        channelId,
      },
    });
    
    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }
    
    // Получение сообщений
    const messages = await prisma.message.findMany({
      where: { chatId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    
    return NextResponse.json(messages);
  } catch (error) {
    console.error("[MESSAGES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Отправка сообщений
export async function POST(
  req: Request,
  { params }: { params: { channelId: string; chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { content } = await req.json();
    const paramsData = await params;
    const channelId = paramsData.channelId;
    const chatId = paramsData.chatId;
    
    if (!content || typeof content !== "string") {
      return new NextResponse("Invalid content", { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }
    
    // Проверка существования канала
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
    });
    
    if (!channel) {
      return new NextResponse("Channel not found", { status: 404 });
    }
    
    // Проверка, является ли пользователь членом канала
    const member = await prisma.channelMember.findFirst({
      where: {
        channelId,
        userId: user.id,
      },
    });
    
    if (!member) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    
    // Проверка существования чата
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        channelId,
      },
    });
    
    if (!chat) {
      return new NextResponse("Chat not found", { status: 404 });
    }
    
    // Создание сообщения
    const message = await prisma.message.create({
      data: {
        content,
        userId: user.id,
        chatId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(message);
  } catch (error) {
    console.error("[MESSAGES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 