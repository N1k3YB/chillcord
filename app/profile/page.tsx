"use client";

import { AccountForm } from "@/components/profile/AccountForm";

export default function ProfilePage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Моя учетная запись</h1>
        <p className="text-zinc-400 mt-1">
          Управляйте информацией профиля и настройками учетной записи
        </p>
      </div>
      
      <AccountForm />
    </div>
  );
} 