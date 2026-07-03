import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  deleteRound as deleteRoundSession,
  previewRound,
  settleRound,
  undoLastRound as undoLastRoundSession,
  type RoundPreview,
} from '@/domain/roundSettlement';
import type { AntiTributePresetId } from '@/types/houseRules';
import type {
  GameSession,
  HouseRules,
  Player,
  Position,
  Team,
} from '@/types/game';
import { DEFAULT_HOUSE_RULES } from '@/types/game';
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
  setRank: (rankIndex: number, playerId: string) => void;
  resetRoundDraft: () => void;
  setAntiTribute: (value: boolean) => void;
  confirmRound: () => void;
  undoLastRound: () => void;
  clearHistory: () => void;
  deleteRound: (roundId: string) => void;
}

const EMPTY_RANKS: Array<string | null> = [null, null, null, null];

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
      roundDraft: { ranks: [...EMPTY_RANKS], isAntiTribute: false },
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
          createdAt: now,
          updatedAt: now,
        };

        set({
          session,
          roundDraft: { ranks: [...EMPTY_RANKS], isAntiTribute: false },
        });
      },
      setRank: (rankIndex, playerId) => {
        if (rankIndex < 0 || rankIndex > 3) return;
        set((state) => {
          const nextRanks = state.roundDraft.ranks.map((rank) =>
            rank === playerId ? null : rank,
          );
          nextRanks[rankIndex] = playerId || null;
          return {
            roundDraft: { ...state.roundDraft, ranks: nextRanks },
          };
        });
      },
      resetRoundDraft: () =>
        set((state) => ({
          roundDraft: {
            ...state.roundDraft,
            ranks: [...EMPTY_RANKS],
            isAntiTribute: false,
          },
        })),
      setAntiTribute: (value) =>
        set((state) => ({
          roundDraft: { ...state.roundDraft, isAntiTribute: value },
        })),
      confirmRound: () => {
        const state = get();
        if (!state.session) return;
        const settled = settleRound(state.session, state.roundDraft);
        if (!settled) return;

        set({
          session: settled.nextSession,
          roundDraft: { ranks: [...EMPTY_RANKS], isAntiTribute: false },
        });
      },
      undoLastRound: () =>
        set((state) => {
          if (!state.session) return state;
          const session = undoLastRoundSession(state.session);
          if (!session) return state;
          return {
            session,
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
              updatedAt: new Date().toISOString(),
            },
          };
        }),
      deleteRound: (roundId) =>
        set((state) => {
          if (!state.session) return state;
          const session = deleteRoundSession(state.session, roundId);
          if (!session) return state;
          return { session };
        }),
    }),
    {
      name: 'guandan-master:v1',
      version: 1,
      storage: createJSONStorage(() => localStorage),
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
