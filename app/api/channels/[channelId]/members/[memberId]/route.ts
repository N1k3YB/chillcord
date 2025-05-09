import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Обновление роли участника канала
export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string, memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { channelId, memberId } = params;
    
    if (!channelId || !memberId) {
      return new NextResponse("Channel ID и Member ID обязательны", { status: 400 });
    }
    
    const body = await req.json();
    const { role, permissions } = body;
    
    if (!role || !["ADMIN", "MEMBER"].includes(role)) {
      return new NextResponse("Некорректная роль", { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Проверяем, является ли пользователь администратором канала с правом управления ролями
    const userMembership = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: user.id,
          channelId,
        },
      },
    });
    
    if (!userMembership || userMembership.role !== "ADMIN") {
      return new NextResponse("Доступ запрещен. Только администратор может изменять роли", { status: 403 });
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
    
    // Проверяем, является ли текущий пользователь владельцем канала или имеет право управлять ролями
    const isOwner = channel.ownerId === user.id;
    const canManageRoles = (userMembership as any).canManageRoles === true;
    
    if (!isOwner && !canManageRoles) {
      return new NextResponse("Доступ запрещен. У вас нет прав на управление ролями", { status: 403 });
    }
    
    const targetMember = await prisma.channelMember.findFirst({
      where: {
        id: memberId,
        channelId,
      },
      include: {
        user: true,
      },
    });
    
    if (!targetMember) {
      return new NextResponse("Участник не найден", { status: 404 });
    }
    
    // Проверяем, не пытаемся ли изменить роль владельца канала
    if (targetMember.user.id === channel.ownerId) {
      return new NextResponse("Невозможно изменить роль владельца канала", { status: 400 });
    }
    
    // Подготовка данных для обновления
    const updateData: any = { role };
    
    // Если назначаем роль ADMIN, то учитываем переданные разрешения
    if (role === "ADMIN" && permissions) {
      // Только владелец канала может назначать право на удаление канала
      if (permissions.canDeleteChannel !== undefined) {
        if (!isOwner) {
          return new NextResponse("Только владелец канала может назначать право на удаление канала", { status: 403 });
        }
        updateData.canDeleteChannel = permissions.canDeleteChannel;
      }
      
      // Добавляем остальные разрешения
      if (permissions.canManageRoles !== undefined) updateData.canManageRoles = permissions.canManageRoles;
      if (permissions.canRemoveMembers !== undefined) updateData.canRemoveMembers = permissions.canRemoveMembers;
      if (permissions.canEditChannel !== undefined) updateData.canEditChannel = permissions.canEditChannel;
    } else if (role === "MEMBER") {
      // Если понижаем до обычного участника, сбрасываем все права администратора
      updateData.canDeleteChannel = false;
      updateData.canManageRoles = false;
      updateData.canRemoveMembers = false;
      updateData.canEditChannel = false;
    }
    
    // Обновляем роль участника
    const updatedMember = await prisma.channelMember.update({
      where: {
        id: memberId,
      },
      data: updateData,
    });
    
    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("[CHANNEL_MEMBER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Удаление участника из канала
export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string, memberId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { channelId, memberId } = params;
    
    if (!channelId || !memberId) {
      return new NextResponse("Channel ID и Member ID обязательны", { status: 400 });
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
    const userMembership = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: user.id,
          channelId,
        },
      },
    });
    
    if (!userMembership || userMembership.role !== "ADMIN") {
      return new NextResponse("Доступ запрещен. Только администратор может удалять участников", { status: 403 });
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
    
    // Проверяем, имеет ли администратор право удалять участников
    const isOwner = channel.ownerId === user.id;
    const canRemoveMembers = (userMembership as any).canRemoveMembers === true;
    
    if (!isOwner && !canRemoveMembers) {
      return new NextResponse("Доступ запрещен. У вас нет прав на удаление участников", { status: 403 });
    }
    
    // Проверяем существование участника
    const targetMember = await prisma.channelMember.findFirst({
      where: {
        id: memberId,
        channelId,
      },
      include: {
        user: true,
      },
    });
    
    if (!targetMember) {
      return new NextResponse("Участник не найден", { status: 404 });
    }
    
    // Проверяем, не пытается ли админ удалить владельца канала
    if (targetMember.user.id === channel.ownerId) {
      return new NextResponse("Невозможно удалить владельца канала", { status: 400 });
    }
    
    // Проверяем, не пытается ли админ удалить сам себя
    if (targetMember.userId === user.id) {
      return new NextResponse("Вы не можете удалить себя из канала. Передайте права администратора другому участнику сначала", { status: 400 });
    }
    
    // Удаляем участника
    await prisma.channelMember.delete({
      where: {
        id: memberId,
      },
    });
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CHANNEL_MEMBER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 