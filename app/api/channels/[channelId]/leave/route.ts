import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Выход пользователя из канала
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
      return new NextResponse("Вы не являетесь участником этого канала", { status: 400 });
    }
    
    // Получаем информацию о канале
    const channel = await prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });
    
    if (!channel) {
      return new NextResponse("Канал не найден", { status: 404 });
    }
    
    // Проверяем, не является ли пользователь владельцем канала
    if (channel.ownerId === user.id) {
      return new NextResponse("Владелец канала не может выйти из него. Передайте права владения другому участнику или удалите канал", { status: 400 });
    }
    
    // Удаляем пользователя из участников канала
    await prisma.channelMember.delete({
      where: {
        userId_channelId: {
          userId: user.id,
          channelId,
        },
      },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CHANNEL_LEAVE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 