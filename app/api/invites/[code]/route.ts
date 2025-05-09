import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Получение информации о приглашении без авторизации
export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = await params;
    
    if (!code) {
      return new NextResponse("Invite code is required", { status: 400 });
    }
    
    // Ищем приглашение по коду
    const invite = await prisma.channelInvite.findUnique({
      where: {
        code,
      },
      include: {
        channel: {
          select: {
            id: true,
            name: true,
            description: true,
            isPublic: true,
          },
        },
      },
    });
    
    if (!invite) {
      return new NextResponse("Приглашение не найдено", { status: 404 });
    }
    
    // Проверяем, не истекло ли приглашение
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return new NextResponse("Приглашение истекло", { status: 410 });
    }
    
    // Проверяем, не превышено ли максимальное количество использований
    if (invite.maxUses && invite.uses >= invite.maxUses) {
      return new NextResponse("Превышено максимальное количество использований приглашения", { status: 410 });
    }
    
    // Возвращаем информацию о канале для превью
    return NextResponse.json({
      channelId: invite.channel.id,
      channelName: invite.channel.name,
      channelDescription: invite.channel.description,
      isPublic: invite.channel.isPublic,
    });
  } catch (error) {
    console.error("[INVITE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Присоединение к каналу по коду приглашения
export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { code } = await params;
    
    if (!code) {
      return new NextResponse("Invite code is required", { status: 400 });
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Ищем приглашение по коду
    const invite = await prisma.channelInvite.findUnique({
      where: {
        code,
      },
    });
    
    if (!invite) {
      return new NextResponse("Приглашение не найдено", { status: 404 });
    }
    
    // Проверяем, не истекло ли приглашение
    if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
      return new NextResponse("Приглашение истекло", { status: 410 });
    }
    
    // Проверяем, не превышено ли максимальное количество использований
    if (invite.maxUses && invite.uses >= invite.maxUses) {
      return new NextResponse("Превышено максимальное количество использований приглашения", { status: 410 });
    }
    
    // Проверяем, не является ли пользователь уже участником канала
    const existingMembership = await prisma.channelMember.findUnique({
      where: {
        userId_channelId: {
          userId: user.id,
          channelId: invite.channelId,
        },
      },
    });
    
    if (existingMembership) {
      return new NextResponse("Вы уже являетесь участником этого канала", { status: 400 });
    }
    
    // Создаем новое членство в канале
    await prisma.channelMember.create({
      data: {
        userId: user.id,
        channelId: invite.channelId,
        role: "MEMBER",
      },
    });
    
    // Увеличиваем счетчик использований приглашения
    await prisma.channelInvite.update({
      where: {
        id: invite.id,
      },
      data: {
        uses: {
          increment: 1,
        },
      },
    });
    
    // Получаем обновленную информацию о канале
    const channel = await prisma.channel.findUnique({
      where: {
        id: invite.channelId,
      },
    });
    
    return NextResponse.json(channel);
  } catch (error) {
    console.error("[INVITE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 