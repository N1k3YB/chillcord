import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LastRouteState {
  lastChatRoute: string;
  setLastChatRoute: (route: string) => void;
}

export const useLastRouteStore = create<LastRouteState>()(
  persist(
    (set) => ({
      lastChatRoute: '/chats',
      setLastChatRoute: (route: string) => set({ lastChatRoute: route }),
    }),
    {
      name: 'last-route-storage',
    }
  )
); 