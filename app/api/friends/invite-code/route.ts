import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// Генерация случайного кода приглашения
function generateInviteCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

// Получение кода приглашения пользователя
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, inviteCode: true }
    });
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }
    
    // Если у пользователя еще нет кода приглашения, генерируем новый
    if (!user.inviteCode) {
      const inviteCode = generateInviteCode();
      
      await prisma.user.update({
        where: { id: user.id },
        data: { inviteCode }
      });
      
      return NextResponse.json({ inviteCode });
    }
    
    return NextResponse.json({ inviteCode: user.inviteCode });
  } catch (error) {
    console.error("[INVITE_CODE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Генерация нового кода приглашения
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }
    
    // Генерируем новый код и обновляем запись пользователя
    const inviteCode = generateInviteCode();
    
    await prisma.user.update({
      where: { id: user.id },
      data: { inviteCode }
    });
    
    return NextResponse.json({ inviteCode });
  } catch (error) {
    console.error("[INVITE_CODE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 