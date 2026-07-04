import { create } from 'zustand';

const FONT_SCALE_STORAGE_KEY = 'guandan-master:ui:font-scale';
const MIN_FONT_SCALE = 100;
const MAX_FONT_SCALE = 150;
const FONT_SCALE_STEP = 10;

function clampFontScale(value: number): number {
  return Math.max(MIN_FONT_SCALE, Math.min(MAX_FONT_SCALE, value));
}

function readFontScale(): number {
  if (typeof window === 'undefined') return 110;
  const stored = window.localStorage.getItem(FONT_SCALE_STORAGE_KEY);
  if (!stored) return 110;
  const parsed = Number(stored);
  if (!Number.isFinite(parsed)) return 110;
  return clampFontScale(Math.round(parsed));
}

function persistFontScale(value: number): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(value));
}

interface UiState {
  toastMessage: string | null;
  fontScale: number;
  setupResetDialogOpen: boolean;
  gameAntiTributeDialogOpen: boolean;
  historyClearDialogOpen: boolean;
  showToast: (message: string, durationMs?: number) => void;
  increaseFontScale: () => void;
  decreaseFontScale: () => void;
  resetFontScale: () => void;
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
  fontScale: readFontScale(),
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
  increaseFontScale: () =>
    set((state) => {
      const nextScale = clampFontScale(state.fontScale + FONT_SCALE_STEP);
      persistFontScale(nextScale);
      return { fontScale: nextScale };
    }),
  decreaseFontScale: () =>
    set((state) => {
      const nextScale = clampFontScale(state.fontScale - FONT_SCALE_STEP);
      persistFontScale(nextScale);
      return { fontScale: nextScale };
    }),
  resetFontScale: () =>
    set(() => {
      const nextScale = 110;
      persistFontScale(nextScale);
      return { fontScale: nextScale };
    }),
  openSetupResetDialog: () => set({ setupResetDialogOpen: true }),
  closeSetupResetDialog: () => set({ setupResetDialogOpen: false }),
  openGameAntiTributeDialog: () => set({ gameAntiTributeDialogOpen: true }),
  closeGameAntiTributeDialog: () => set({ gameAntiTributeDialogOpen: false }),
  openHistoryClearDialog: () => set({ historyClearDialogOpen: true }),
  closeHistoryClearDialog: () => set({ historyClearDialogOpen: false }),
}));
