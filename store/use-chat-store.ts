import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatState {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  clearSession: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      sessionId: '',//f4483076-ccad-421b-a41f-4f6f8171d41b
      setSessionId: (id) => set({ sessionId: id }),
      clearSession: () => set({ sessionId: null }),
    }),
    {
      name: 'chat-storage', // unique name for localStorage
    }
  )
);
