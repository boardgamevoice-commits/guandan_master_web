import { create } from 'zustand';

interface UiState {
  toastMessage: string | null;
  setupResetDialogOpen: boolean;
  gameAntiTributeDialogOpen: boolean;
  historyClearDialogOpen: boolean;
  showToast: (message: string, durationMs?: number) => void;
  openSetupResetDialog: () => void;
  closeSetupResetDialog: () => void;
  openGameAntiTributeDialog: () => void;
  closeGameAntiTributeDialog: () => void;
  openHistoryClearDialog: () => void;
  closeHistoryClearDialog: () => void;
}

let toastTimer: number | null = null;

export const useUiStore = create<UiState>()((set) => ({
  toastMessage: null,
  setupResetDialogOpen: false,
  gameAntiTributeDialogOpen: false,
  historyClearDialogOpen: false,
  showToast: (message, durationMs = 2000) => {
    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    set({ toastMessage: message });
    toastTimer = window.setTimeout(() => {
      set({ toastMessage: null });
      toastTimer = null;
    }, durationMs);
  },
  openSetupResetDialog: () => set({ setupResetDialogOpen: true }),
  closeSetupResetDialog: () => set({ setupResetDialogOpen: false }),
  openGameAntiTributeDialog: () => set({ gameAntiTributeDialogOpen: true }),
  closeGameAntiTributeDialog: () => set({ gameAntiTributeDialogOpen: false }),
  openHistoryClearDialog: () => set({ historyClearDialogOpen: true }),
  closeHistoryClearDialog: () => set({ historyClearDialogOpen: false }),
}));
