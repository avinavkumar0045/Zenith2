import { create } from 'zustand';

export interface WorkingMemoryState {
  currentGoal: string | null;
  currentTask: string | null;
  currentTarget: string | null;
  currentPlan: any | null;
  
  setGoal: (goal: string | null) => void;
  setTask: (task: string | null) => void;
  setTarget: (target: string | null) => void;
  setPlan: (plan: any | null) => void;
  clearWorkingMemory: () => void;
}

export const useWorkingMemoryStore = create<WorkingMemoryState>((set) => ({
  currentGoal: null,
  currentTask: null,
  currentTarget: null,
  currentPlan: null,

  setGoal: (goal) => set({ currentGoal: goal }),
  setTask: (task) => set({ currentTask: task }),
  setTarget: (target) => set({ currentTarget: target }),
  setPlan: (plan) => set({ currentPlan: plan }),
  clearWorkingMemory: () => set({
    currentGoal: null,
    currentTask: null,
    currentTarget: null,
    currentPlan: null
  })
}));
export default useWorkingMemoryStore;
