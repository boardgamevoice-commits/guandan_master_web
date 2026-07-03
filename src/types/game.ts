export type Team = 'our' | 'opponent';

export type Position = '东' | '南' | '西' | '北';

export interface Player {
  id: string;
  name: string;
  position: Position;
  team: Team;
}

export type ResultType =
  | 'double_down'
  | 'single_down_opponent'
  | 'single_down_our';

export interface GameRoundRecord {
  id: string;
  roundNumber: number;
  date: string;
  ranks: string[];
  resultType: ResultType;
  isAntiTribute: boolean;
  currentWildCard: number;
  ourLevelSnapshot: number;
  opponentLevelSnapshot: number;
}

import type { AntiTributePresetId } from '@/domain/houseRules';

export interface HouseRules {
  /** 打 A 是否必须双下才能过 A */
  aceRequiresDoubleDown: boolean;
  /** 抗贡条件预设，见 domain/houseRules.ts */
  antiTributePreset: AntiTributePresetId;
}

export interface GameSession {
  id: string;
  players: Player[];
  ourLevel: number;
  opponentLevel: number;
  currentDealer: Team;
  houseRules: HouseRules;
  rounds: GameRoundRecord[];
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_HOUSE_RULES: HouseRules = {
  aceRequiresDoubleDown: true,
  antiTributePreset: 'combined_double_joker',
};

export const LEVEL_LABELS: Record<number, string> = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
};

export function levelToLabel(level: number): string {
  return LEVEL_LABELS[level] ?? String(level);
}
