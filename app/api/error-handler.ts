import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

/**
 * Обработчик ошибок Prisma для API-маршрутов
 * 
 * @param error Перехваченная ошибка
 * @param context Контекст маршрута для логирования
 * @returns NextResponse с соответствующим статусом и сообщением
 */
export function handlePrismaError(error: any, context: string): NextResponse {
  console.error(`[${context}]`, error);
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Обработка известных ошибок Prisma
    switch (error.code) {
      case 'P2002': // Нарушение уникального ограничения
        return new NextResponse("Запись с такими данными уже существует", { status: 409 });
      
      case 'P2025': // Запись не найдена
        return new NextResponse("Ресурс не найден", { status: 404 });
      
      case 'P2003': // Нарушение внешнего ключа
        return new NextResponse("Связанный ресурс не найден", { status: 404 });
      
      case 'P2018': // Некорректный запрос
        return new NextResponse("Некорректный запрос к базе данных", { status: 400 });
      
      default:
        return new NextResponse(`Ошибка базы данных (${error.code})`, { status: 500 });
    }
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    // Ошибка инициализации (соединение с БД)
    return new NextResponse("База данных недоступна. Пожалуйста, попробуйте позже", { status: 503 });
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    // Ошибка валидации данных
    return new NextResponse("Ошибка валидации данных", { status: 400 });
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    // Критическая ошибка Prisma
    return new NextResponse("Критическая ошибка сервера", { status: 500 });
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    // Неизвестная ошибка запроса
    return new NextResponse("Неизвестная ошибка запроса", { status: 500 });
  }
  
  // Ошибка по умолчанию
  return new NextResponse("Внутренняя ошибка сервера", { status: 500 });
} 