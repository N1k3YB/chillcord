import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Создание нового чата в канале
export async function POST(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { channelId } = params;
    
    if (!channelId) {
      return new NextResponse("Channel ID is required", { status: 400 });
    }
    
    const body = await req.json();
    const { name, description, type = "TEXT" } = body;
    
    if (!name) {
      return new NextResponse("Имя чата обязательно", { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Проверяем, является ли пользователь администратором канала
    const membership = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: user.id,
          channelId,
        },
      },
    });
    
    if (!membership || membership.role !== "ADMIN") {
      return new NextResponse("Только администраторы могут создавать чаты", { status: 403 });
    }
    
    // Создаем чат в канале
    const chat = await prisma.chat.create({
      data: {
        name,
        description,
        type,
        channelId,
      },
    });
    
    return NextResponse.json(chat);
  } catch (error) {
    console.error("[CHATS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Получение списка чатов в канале
export async function GET(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { channelId } = params;
    
    if (!channelId) {
      return new NextResponse("Channel ID is required", { status: 400 });
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
    
    // Получаем все чаты в канале
    const chats = await prisma.chat.findMany({
      where: {
        channelId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    
    return NextResponse.json(chats);
  } catch (error) {
    console.error("[CHATS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 