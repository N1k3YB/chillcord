"use client";

import { User } from "lucide-react";
import { AccountForm } from "@/components/profile/AccountForm";
import { TabHeader } from "@/components/profile/TabHeader";
import { TabContent } from "@/components/profile/TabContent";

export default function ProfilePage() {
  return (
    <div className="p-8">
      <TabHeader 
        title="Моя учетная запись" 
        description="Управляйте информацией профиля и настройками учетной записи"
        icon={User}
      />
      
      <TabContent>
        <AccountForm />
      </TabContent>
    </div>
  );
} 