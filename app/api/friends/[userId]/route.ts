import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Добавление пользователя в друзья по ID
export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const targetUserId = params.userId;

    if (!targetUserId) {
      return new NextResponse("Missing userId parameter", { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!currentUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Проверяем, что пользователь не пытается добавить сам себя
    if (currentUser.id === targetUserId) {
      return new NextResponse("Cannot add yourself as a friend", { status: 400 });
    }

    // Проверяем, существует ли целевой пользователь
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true }
    });

    if (!targetUser) {
      return new NextResponse("Target user not found", { status: 404 });
    }

    // Проверяем, существует ли уже дружба между пользователями
    const existingFriendship = await prisma.$queryRaw`
      SELECT * FROM "Friendship"
      WHERE ("user1Id" = ${currentUser.id} AND "user2Id" = ${targetUserId})
      OR ("user1Id" = ${targetUserId} AND "user2Id" = ${currentUser.id})
    `;

    if (Array.isArray(existingFriendship) && existingFriendship.length > 0) {
      return new NextResponse("Already friends", { status: 400 });
    }

    // Проверяем, существует ли запрос на дружбу от целевого пользователя
    const existingRequests = await prisma.$queryRaw`
      SELECT * FROM "FriendRequest" 
      WHERE "senderId" = ${targetUserId} AND "receiverId" = ${currentUser.id}
    `;

    // Если запрос существует, принимаем его и создаем дружбу
    if (Array.isArray(existingRequests) && existingRequests.length > 0) {
      const existingRequest = existingRequests[0];
      
      // Удаляем запрос
      await prisma.$executeRaw`
        DELETE FROM "FriendRequest" WHERE id = ${existingRequest.id}
      `;

      // Создаем дружбу
      await prisma.$executeRaw`
        INSERT INTO "Friendship" ("id", "user1Id", "user2Id", "createdAt")
        VALUES (gen_random_uuid(), ${currentUser.id}, ${targetUserId}, NOW())
      `;

      return NextResponse.json({
        message: "Friend request accepted"
      }, { status: 200 });
    } 
    // Иначе создаем новый запрос на дружбу
    else {
      // Проверяем, не отправлял ли текущий пользователь уже запрос
      const existingOutgoingRequests = await prisma.$queryRaw`
        SELECT * FROM "FriendRequest" 
        WHERE "senderId" = ${currentUser.id} AND "receiverId" = ${targetUserId}
      `;

      if (Array.isArray(existingOutgoingRequests) && existingOutgoingRequests.length > 0) {
        return new NextResponse("Friend request already sent", { status: 400 });
      }

      // Создаем новый запрос на дружбу
      await prisma.$executeRaw`
        INSERT INTO "FriendRequest" ("id", "senderId", "receiverId", "createdAt")
        VALUES (gen_random_uuid(), ${currentUser.id}, ${targetUserId}, NOW())
      `;

      return NextResponse.json({
        message: "Friend request sent"
      }, { status: 201 });
    }
  } catch (error) {
    console.error("[FRIEND_USER_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 