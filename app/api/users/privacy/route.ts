import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Получение настроек приватности пользователя
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        profileVisible: true 
      }
    });
    
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }
    
    return NextResponse.json({
      profileVisible: user.profileVisible
    });
  } catch (error) {
    console.error("[PRIVACY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Обновление настроек приватности пользователя
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const body = await req.json();
    const { profileVisible } = body;
    
    if (profileVisible === undefined) {
      return new NextResponse("Missing required fields", { status: 400 });
    }
    
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: { profileVisible },
      select: { profileVisible: true }
    });
    
    return NextResponse.json(user);
  } catch (error) {
    console.error("[PRIVACY_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 