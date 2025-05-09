import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Получение списка участников канала
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
      return new NextResponse("Доступ запрещен. Только администратор может просматривать участников канала", { status: 403 });
    }
    
    // Получаем информацию о всех членах канала, включая пользовательские данные
    const members = await prisma.channelMember.findMany({
      where: {
        channelId,
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
    
    // Добавляем информацию о правах каждого члена
    const formattedMembers = members.map(member => ({
      ...member,
      permissions: {
        canDeleteChannel: member.canDeleteChannel || false,
        canManageRoles: member.canManageRoles || false,
        canRemoveMembers: member.canRemoveMembers || false,
        canEditChannel: member.canEditChannel || false
      }
    }));
    
    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error("[CHANNEL_MEMBERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 