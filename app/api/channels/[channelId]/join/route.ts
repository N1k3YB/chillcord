import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Присоединение к каналу
export async function POST(
  req: Request,
  { params }: { params: { channelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { channelId } = await params;
    
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
    
    // Проверяем, существует ли канал и является ли он публичным
    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });
    
    if (!channel) {
      return new NextResponse("Канал не найден", { status: 404 });
    }
    
    if (!channel.isPublic) {
      return new NextResponse("Этот канал не является публичным", { status: 403 });
    }
    
    // Проверяем, не состоит ли пользователь уже в этом канале
    const existingMembership = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: user.id,
          channelId,
        },
      },
    });
    
    if (existingMembership) {
      return new NextResponse("Вы уже состоите в этом канале", { status: 400 });
    }
    
    // Добавляем пользователя в канал
    await prisma.channelMember.create({
      data: {
        userId: user.id,
        channelId,
        role: "MEMBER", // Устанавливаем роль MEMBER
      },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CHANNEL_JOIN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 