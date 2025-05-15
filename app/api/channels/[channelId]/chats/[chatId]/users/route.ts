import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Получение списка всех пользователей, участвующих в чате (не обязательно онлайн)
export async function GET(
  req: Request,
  { params }: { params: { channelId: string, chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { channelId, chatId } = await params;
    
    if (!channelId || !chatId) {
      return new NextResponse("Channel ID and Chat ID are required", { status: 400 });
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
    
    // Получаем всех участников канала
    const users = await prisma.user.findMany({
      where: {
        channelMemberships: {
          some: {
            channelId
          }
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        channelMemberships: {
          where: {
            channelId
          },
          select: {
            role: true
          }
        }
      }
    });
    
    // Форматируем данные пользователей
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      image: user.image,
      role: user.channelMemberships[0]?.role || "MEMBER"
    }));
    
    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error("[CHAT_USERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 