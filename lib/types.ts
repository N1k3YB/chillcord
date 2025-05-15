// Типы для временного использования до применения миграции
export interface BannedUser {
  id: string;
  userId: string;
  chatId: string;
  reason: string | null;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
  };
}

// Модели для работы с чатом
export interface Chat {
  id: string;
  name: string;
  description: string | null;
  type: string;
  channelId: string;
  createdAt: Date;
  updatedAt: Date;
  isProtected: boolean;
  password: string | null;
}

// Расширенный интерфейс канала
export interface Channel {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  role?: string;
}

// Интерфейс для участника канала
export interface ChannelMember {
  id: string;
  userId: string;
  channelId: string;
  role: string;
  canDeleteChannel: boolean;
  canManageRoles: boolean;
  canRemoveMembers: boolean;
  canEditChannel: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string;
    image: string | null;
  };
}

// Интерфейс для сообщения
export interface Message {
  id: string;
  content: string;
  userId: string;
  chatId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  user?: {
    id: string;
    name: string;
    image: string | null;
    email?: string | null;
  };
  isTemp?: boolean;      // Флаг для временных сообщений
  sendFailed?: boolean;  // Флаг для сообщений с ошибкой отправки
}

// Интерфейс для работы с Socket.IO
import { Server as NetServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

export interface ServerIOSocket extends NodeJS.Socket {
  server: NetServer & {
    io?: ServerIO;
  };
}

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: ServerIOSocket;
} 