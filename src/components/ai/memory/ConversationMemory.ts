import { create } from 'zustand';
import { Message } from '../ZenithAI.types';

export interface ConversationMemoryState {
  messages: Message[];
  isThinking: boolean;
  activeReasoningStep: string;
  
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  setThinking: (thinking: boolean, step?: string) => void;
  setReasoningStep: (step: string) => void;
  clearConversation: () => void;
}

export const useConversationMemoryStore = create<ConversationMemoryState>((set) => ({
  messages: [
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Greetings. I am Zenith AI, your orbital orchestration assistant. Ask me to plan sessions, track satellites, configure custom layers, or fast-forward simulated timelines.',
      timestamp: new Date().toISOString(),
      status: 'done'
    }
  ],
  isThinking: false,
  activeReasoningStep: '',

  addMessage: (msg) => set((state) => {
    const newMessage: Message = {
      ...msg,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    return {
      messages: [...state.messages, newMessage]
    };
  }),

  updateMessage: (id, updates) => set((state) => ({
    messages: state.messages.map(m => m.id === id ? { ...m, ...updates } : m)
  })),

  setThinking: (thinking, step = '') => set({
    isThinking: thinking,
    activeReasoningStep: step
  }),

  setReasoningStep: (step) => set({
    activeReasoningStep: step
  }),

  clearConversation: () => set((state) => ({
    messages: [
      {
        id: 'welcome',
        sender: 'ai',
        text: 'System memory flushed. Ready for active telemetry coordination.',
        timestamp: new Date().toISOString(),
        status: 'done'
      }
    ],
    isThinking: false,
    activeReasoningStep: ''
  }))
}));
