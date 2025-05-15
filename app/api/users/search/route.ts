import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Поиск пользователей по имени или коду приглашения
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    
    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }
    
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    
    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }
    
    // Массив для хранения результатов поиска
    let users = [];
    
    // Проверяем, может ли запрос быть кодом приглашения (8 символов, только hex)
    if (query.length === 8 && /^[A-F0-9]{8}$/i.test(query)) {
      try {
        // Пытаемся найти пользователя по коду приглашения
        const userByInviteCode = await prisma.user.findFirst({
          where: { 
            inviteCode: query.toUpperCase(),
            NOT: { id: currentUser.id }
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        });
        
        if (userByInviteCode) {
          users.push({
            id: userByInviteCode.id,
            username: userByInviteCode.email.split('@')[0],
            name: userByInviteCode.name,
            email: userByInviteCode.email,
            image: userByInviteCode.image,
            status: "OFFLINE",
            matchType: "inviteCode"
          });
          
          // Если нашли по коду приглашения, сразу возвращаем результат
          return NextResponse.json(users);
        }
      } catch (error) {
        // Если возникла ошибка при поиске по коду приглашения, продолжаем поиск по имени
        console.error("Error searching by invite code:", error);
      }
    }
    
    // Ищем по имени или email
    const usersByName = await prisma.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } }
            ]
          },
          { NOT: { id: currentUser.id } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      },
      take: 10
    });
    
    // Преобразуем результаты поиска по имени в формат, совместимый с интерфейсом Friend
    const formattedUsers = usersByName.map(user => ({
      id: user.id,
      username: user.email.split('@')[0], // Создаем username из email
      name: user.name,
      email: user.email,
      image: user.image,
      status: "OFFLINE", // По умолчанию считаем пользователей оффлайн
      matchType: "name"
    }));
    
    // Добавляем результаты поиска по имени к общему массиву результатов
    users = [...users, ...formattedUsers];
    
    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_SEARCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 