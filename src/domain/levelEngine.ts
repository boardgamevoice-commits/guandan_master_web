import type { Player, ResultType, Team } from '@/types/game';

export interface LevelChange {
  ourDelta: number;
  opponentDelta: number;
  resultType: ResultType;
  winner: Team;
}

/**
 * 根据 1–4 名玩家 ID 顺序推导升级结果。
 * 规则与 iOS PRD 5.1 一致。
 */
export function calculateLevelChange(
  rankedPlayerIds: string[],
  players: Player[],
): LevelChange {
  if (rankedPlayerIds.length !== 4) {
    throw new Error('需要完整的 1–4 名排名');
  }

  const playerMap = new Map(players.map((p) => [p.id, p]));
  const teams = rankedPlayerIds.map((id) => playerMap.get(id)?.team);

  if (teams.some((t) => !t)) {
    throw new Error('排名包含无效玩家');
  }

  const [first, second, third, fourth] = teams as Team[];

  if (first === second) {
    return {
      ourDelta: first === 'our' ? 3 : 0,
      opponentDelta: first === 'opponent' ? 3 : 0,
      resultType: 'double_down',
      winner: first,
    };
  }

  if (first === third) {
    const winner: Team = first;
    return {
      ourDelta: winner === 'our' ? 2 : 0,
      opponentDelta: winner === 'opponent' ? 2 : 0,
      resultType: 'single_down_opponent',
      winner,
    };
  }

  if (first === fourth) {
    const winner: Team = first;
    return {
      ourDelta: winner === 'our' ? 1 : 0,
      opponentDelta: winner === 'opponent' ? 1 : 0,
      resultType: 'single_down_our',
      winner,
    };
  }

  throw new Error('无法推导胜负：排名不符合掼蛋规则');
}

export function applyLevelChange(
  ourLevel: number,
  opponentLevel: number,
  change: LevelChange,
): { ourLevel: number; opponentLevel: number } {
  const cap = 14;
  return {
    ourLevel: Math.min(ourLevel + change.ourDelta, cap),
    opponentLevel: Math.min(opponentLevel + change.opponentDelta, cap),
  };
}
