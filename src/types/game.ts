import type { AntiTributePresetId } from '@/types/houseRules';

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
  /** 该局打级方级牌（逢人配）快照 */
  currentWildCard: number;
  ourLevelSnapshot: number;
  opponentLevelSnapshot: number;
}

export interface PendingTributeReview {
  roundId: string;
  isAntiTribute: boolean;
}

export interface HouseRules {
  aceRequiresDoubleDown: boolean;
  antiTributePreset: AntiTributePresetId;
}

export interface GameSession {
  id: string;
  players: Player[];
  /** 新对局起始级数，用于撤回上一局恢复 */
  initialOurLevel: number;
  initialOpponentLevel: number;
  initialDealerTeam: Team;
  ourLevel: number;
  opponentLevel: number;
  /** 当前打级方（升级方）；RoundBanner 显示其 level */
  playingTeam: Team;
  /** 本局先出牌方（台主）；TeamScoreCard 高亮 */
  currentDealer: Team;
  houseRules: HouseRules;
  rounds: GameRoundRecord[];
  pendingTributeReview: PendingTributeReview | null;
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
