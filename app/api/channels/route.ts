import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Создание нового канала
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const body = await req.json();
    const { name, description, isPublic } = body;
    
    if (!name) {
      return new NextResponse("Имя канала обязательно", { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Создаем канал
    const channel = await prisma.channel.create({
      data: {
        name,
        description,
        isPublic: isPublic ?? false,
        ownerId: user.id,
      },
    });
    
    // Создаем запись о членстве в канале с ролью ADMIN для создателя
    await prisma.channelMember.create({
      data: {
        userId: user.id,
        channelId: channel.id,
        role: "ADMIN",
        // Владелец канала получает все права администратора
        canDeleteChannel: true,
        canManageRoles: true,
        canRemoveMembers: true,
        canEditChannel: true,
      } as any // Используем any для обхода ошибки типизации до обновления Prisma
    });
    
    return NextResponse.json(channel);
  } catch (error) {
    console.error("[CHANNELS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Получение списка каналов пользователя
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Получаем все каналы, в которых пользователь является участником
    const channels = await prisma.channel.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      include: {
        members: {
          where: {
            userId: user.id,
          },
          select: {
            role: true,
          },
        },
      },
    });
    
    // Форматируем данные для отправки на клиент
    const formattedChannels = channels.map((channel: any) => ({
      ...channel,
      role: channel.members[0]?.role,
      members: undefined,
    }));
    
    return NextResponse.json(formattedChannels);
  } catch (error) {
    console.error("[CHANNELS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 