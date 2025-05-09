import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Получение информации о канале
export async function GET(
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
      return new NextResponse("Доступ запрещен", { status: 403 });
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
    
    // Возвращаем данные о канале вместе с ролью пользователя и владельцем канала
    return NextResponse.json({
      ...channel,
      role: membership.role,
    });
  } catch (error) {
    console.error("[CHANNEL_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Обновление настроек канала
export async function PATCH(
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
      return new NextResponse("Доступ запрещен. Только администратор может изменять настройки канала", { status: 403 });
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
    
    // Проверяем, является ли пользователь владельцем канала или имеет права на редактирование
    const isOwner = channel.ownerId === user.id;
    const canEdit = (membership as any).canEditChannel === true;
    
    if (!isOwner && !canEdit) {
      return new NextResponse("Доступ запрещен. У вас нет прав на редактирование настроек канала", { status: 403 });
    }
    
    // Обновляем информацию о канале
    const updatedChannel = await prisma.channel.update({
      where: {
        id: channelId,
      },
      data: {
        name,
        description,
        isPublic: isPublic ?? false,
      },
    });
    
    return NextResponse.json(updatedChannel);
  } catch (error) {
    console.error("[CHANNEL_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Удаление канала
export async function DELETE(
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
      return new NextResponse("Доступ запрещен. Только администратор может удалить канал", { status: 403 });
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
    
    // Проверяем, является ли пользователь владельцем канала или имеет разрешение на удаление канала
    const isOwner = channel.ownerId === user.id;
    const canDelete = (membership as any).canDeleteChannel === true;
    
    if (!isOwner && !canDelete) {
      return new NextResponse("Доступ запрещен. Только владелец канала или администратор с соответствующими правами может удалить его", { status: 403 });
    }
    
    // Удаляем канал (все связанные записи будут удалены каскадно согласно схеме)
    await prisma.channel.delete({
      where: {
        id: channelId,
      },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CHANNEL_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 