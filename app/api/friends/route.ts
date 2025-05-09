import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Получение списка друзей пользователя
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Заглушка для системы друзей - в будущем будет реализована полная функциональность
    return NextResponse.json([]);
  } catch (error) {
    console.error("[FRIENDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 