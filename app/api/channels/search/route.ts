import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Поиск публичных каналов
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    
    if (!query) {
      return NextResponse.json([]);
    }
    
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    // Ищем публичные каналы по названию, исключая те, в которых пользователь уже состоит
    const channels = await prisma.channel.findMany({
      where: {
        isPublic: true,
        name: {
          contains: query,
          mode: 'insensitive', // Регистронезависимый поиск
        },
        members: {
          none: {
            userId: user.id,
          },
        },
      },
      take: 10, // Ограничиваем количество результатов
    });
    
    return NextResponse.json(channels);
  } catch (error) {
    console.error("[CHANNELS_SEARCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 