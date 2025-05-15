import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Получение информации о текущем пользователе
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      }
    });
    
    if (!user) {
      return new NextResponse("Пользователь не найден", { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("[AUTH_ME_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 