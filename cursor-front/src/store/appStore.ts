import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'Scientist' | 'Manager' | 'Mission Planner';

interface AppState {
  role: UserRole;
  selectedPaperIds: string[];
  setRole: (role: UserRole) => void;
  setSelectedPaperIds: (ids: string[]) => void;
  addSelectedPaperId: (id: string) => void;
  removeSelectedPaperId: (id: string) => void;
  clearSelectedPaperIds: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      role: 'Scientist',
      selectedPaperIds: [],
      setRole: (role) => set({ role }),
      setSelectedPaperIds: (ids) => set({ selectedPaperIds: ids }),
      addSelectedPaperId: (id) => set((state) => ({
        selectedPaperIds: [...state.selectedPaperIds, id]
      })),
      removeSelectedPaperId: (id) => set((state) => ({
        selectedPaperIds: state.selectedPaperIds.filter(paperId => paperId !== id)
      })),
      clearSelectedPaperIds: () => set({ selectedPaperIds: [] }),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({ role: state.role }),
    }
  )
);
