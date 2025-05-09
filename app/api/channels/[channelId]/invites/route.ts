import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Генерация уникального кода для приглашения
function generateUniqueCode() {
  // Простая функция генерации ID без использования uuid
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Создание нового приглашения
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
    
    const body = await req.json();
    const { expiresAt, maxUses } = body;
    
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
      return new NextResponse("Только администраторы могут создавать приглашения", { status: 403 });
    }
    
    // Создаем новое приглашение
    const invite = await prisma.channelInvite.create({
      data: {
        code: generateUniqueCode(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses || null,
        uses: 0,
        creatorId: user.id,
        channelId,
      },
    });
    
    return NextResponse.json(invite);
  } catch (error) {
    console.error("[INVITES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Получение всех приглашений для канала
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
      return new NextResponse("Только администраторы могут просматривать приглашения", { status: 403 });
    }
    
    // Получаем все приглашения для канала
    const invites = await prisma.channelInvite.findMany({
      where: {
        channelId,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(invites);
  } catch (error) {
    console.error("[INVITES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 