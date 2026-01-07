import { create } from 'zustand';
// 旧实现（保留，勿删）：使用 persist 中间件持久化存储
// import { persist } from 'zustand/middleware';

interface ChatState {
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  clearSession: () => void;
}

// 旧实现（保留，勿删）：使用 persist 持久化存储
// export const useChatStore = create<ChatState>()(
//   persist(
//     (set) => ({
//       sessionId: '',//f4483076-ccad-421b-a41f-4f6f8171d41b
//       setSessionId: (id) => set({ sessionId: id }),
//       clearSession: () => set({ sessionId: null }),
//     }),
//     {
//       name: 'chat-storage', // unique name for localStorage
//     }
//   )
// );

// 新实现：暂时禁用持久化存储
export const useChatStore = create<ChatState>()((set) => ({
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),
  clearSession: () => set({ sessionId: null }),
}));
