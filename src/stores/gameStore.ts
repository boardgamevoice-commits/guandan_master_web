import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  deleteRound as deleteRoundSession,
  previewRound,
  settleRound,
  undoLastRound as undoLastRoundSession,
  type RoundPreview,
} from '@/domain/roundSettlement';
import { isAntiTributeEnabled } from '@/domain/houseRules';
import type { AntiTributePresetId } from '@/types/houseRules';
import type {
  GameSession,
  HouseRules,
  PendingTributeReview,
  Player,
  Position,
  Team,
} from '@/types/game';
import { DEFAULT_HOUSE_RULES } from '@/types/game';
import {
  EMPTY_RANKS,
  toggleRankPlayer as toggleRankPlayerInDraft,
  undoLastRank as undoLastRankInDraft,
} from '@/domain/rankingDraft';
import type { RoundDraft } from '@/types/round';

interface SetupInput {
  names: Record<Position, string>;
  ourLevel: number;
  opponentLevel: number;
  dealerTeam: Team;
  antiTributePreset: AntiTributePresetId;
  aceRequiresDoubleDown: boolean;
}

interface GameState {
  session: GameSession | null;
  roundDraft: RoundDraft;
  createSession: (input: SetupInput) => void;
  toggleRankPlayer: (playerId: string) => void;
  undoLastRank: () => void;
  resetRoundDraft: () => void;
  setPendingAntiTribute: (value: boolean) => void;
  confirmPendingTributeReview: () => void;
  confirmRound: () => void;
  undoLastRound: () => void;
  clearHistory: () => void;
  deleteRound: (roundId: string) => void;
}

const DEFAULT_NAMES: Record<Position, string> = {
  东: '',
  南: '',
  西: '',
  北: '',
};

function createPlayers(names: Record<Position, string>): Player[] {
  return [
    { id: 'east', position: '东', name: names.东, team: 'opponent' },
    { id: 'south', position: '南', name: names.南, team: 'our' },
    { id: 'west', position: '西', name: names.西, team: 'opponent' },
    { id: 'north', position: '北', name: names.北, team: 'our' },
  ];
}

function getHouseRules(
  antiTributePreset: AntiTributePresetId,
  aceRequiresDoubleDown: boolean,
): HouseRules {
  return {
    ...DEFAULT_HOUSE_RULES,
    antiTributePreset,
    aceRequiresDoubleDown,
  };
}

function ranksReady(ranks: Array<string | null>): ranks is string[] {
  return ranks.every((rank) => typeof rank === 'string');
}

function ensurePendingReview(
  rounds: GameSession['rounds'],
  pending: PendingTributeReview | null,
): PendingTributeReview | null {
  if (!pending) return null;
  return rounds.some((round) => round.id === pending.roundId) ? pending : null;
}

export function getRoundPreview(
  session: GameSession | null,
  draft: RoundDraft,
): RoundPreview | null {
  if (!session || !ranksReady(draft.ranks)) return null;
  return previewRound(session, draft);
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      session: null,
      roundDraft: { ranks: [...EMPTY_RANKS] },
      createSession: (input) => {
        const now = new Date().toISOString();
        const session: GameSession = {
          id: crypto.randomUUID(),
          players: createPlayers(input.names),
          initialOurLevel: input.ourLevel,
          initialOpponentLevel: input.opponentLevel,
          initialDealerTeam: input.dealerTeam,
          ourLevel: input.ourLevel,
          opponentLevel: input.opponentLevel,
          playingTeam: input.dealerTeam,
          currentDealer: input.dealerTeam,
          houseRules: getHouseRules(
            input.antiTributePreset,
            input.aceRequiresDoubleDown,
          ),
          rounds: [],
          pendingTributeReview: null,
          createdAt: now,
          updatedAt: now,
        };

        set({
          session,
          roundDraft: { ranks: [...EMPTY_RANKS] },
        });
      },
      toggleRankPlayer: (playerId) =>
        set((state) => ({
          roundDraft: {
            ...state.roundDraft,
            ranks: toggleRankPlayerInDraft(state.roundDraft.ranks, playerId),
          },
        })),
      undoLastRank: () =>
        set((state) => ({
          roundDraft: {
            ...state.roundDraft,
            ranks: undoLastRankInDraft(state.roundDraft.ranks),
          },
        })),
      resetRoundDraft: () =>
        set((state) => ({
          roundDraft: {
            ...state.roundDraft,
            ranks: [...EMPTY_RANKS],
          },
        })),
      setPendingAntiTribute: (value) =>
        set((state) => ({
          session: state.session?.pendingTributeReview
            ? {
                ...state.session,
                pendingTributeReview: {
                  ...state.session.pendingTributeReview,
                  isAntiTribute: value,
                },
              }
            : state.session,
        })),
      confirmPendingTributeReview: () =>
        set((state) => {
          if (!state.session || !state.session.pendingTributeReview) return state;
          const pending = state.session.pendingTributeReview;
          const rounds = state.session.rounds.map((round) =>
            round.id === pending.roundId
              ? { ...round, isAntiTribute: pending.isAntiTribute }
              : round,
          );
          return {
            session: {
              ...state.session,
              rounds,
              pendingTributeReview: null,
              updatedAt: new Date().toISOString(),
            },
          };
        }),
      confirmRound: () => {
        const state = get();
        if (!state.session) return;
        const settled = settleRound(state.session, state.roundDraft);
        if (!settled) return;

        const pendingTributeReview = isAntiTributeEnabled(
          settled.nextSession.houseRules.antiTributePreset,
        )
          ? { roundId: settled.roundRecord.id, isAntiTribute: false }
          : null;
        set({
          session: {
            ...settled.nextSession,
            pendingTributeReview,
          },
          roundDraft: { ranks: [...EMPTY_RANKS] },
        });
      },
      undoLastRound: () =>
        set((state) => {
          if (!state.session) return state;
          const session = undoLastRoundSession(state.session);
          if (!session) return state;
          const pendingTributeReview = ensurePendingReview(
            session.rounds,
            session.pendingTributeReview,
          );
          return {
            session: {
              ...session,
              pendingTributeReview,
            },
          };
        }),
      clearHistory: () =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              rounds: [],
              ourLevel: state.session.initialOurLevel,
              opponentLevel: state.session.initialOpponentLevel,
              playingTeam: state.session.initialDealerTeam,
              currentDealer: state.session.initialDealerTeam,
              pendingTributeReview: null,
              updatedAt: new Date().toISOString(),
            },
          };
        }),
      deleteRound: (roundId) =>
        set((state) => {
          if (!state.session) return state;
          const session = deleteRoundSession(state.session, roundId);
          if (!session) return state;
          const pendingTributeReview = ensurePendingReview(
            session.rounds,
            session.pendingTributeReview,
          );
          return {
            session: {
              ...session,
              pendingTributeReview,
            },
          };
        }),
    }),
    {
      name: 'guandan-master:v1',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: unknown, version) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return persistedState as {
            session: GameSession | null;
            roundDraft: RoundDraft;
          };
        }
        const current = persistedState as {
          session?: GameSession | null;
          roundDraft?: { ranks?: Array<string | null> };
        };
        const migratedSession = current.session
          ? {
              ...current.session,
              pendingTributeReview:
                version < 2 ? null : current.session.pendingTributeReview ?? null,
            }
          : null;
        return {
          ...current,
          session: migratedSession,
          roundDraft: {
            ranks: current.roundDraft?.ranks ?? [...EMPTY_RANKS],
          },
        };
      },
      partialize: (state) => ({
        session: state.session,
        roundDraft: state.roundDraft,
      }),
    },
  ),
);

export function getDefaultSetupInput(): SetupInput {
  return {
    names: { ...DEFAULT_NAMES },
    ourLevel: 2,
    opponentLevel: 2,
    dealerTeam: 'our',
    antiTributePreset: 'combined_double_joker',
    aceRequiresDoubleDown: true,
  };
}
