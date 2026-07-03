import type { Player, ResultType } from '@/types/game';

export interface TributeRelation {
  fromPlayerId: string;
  toPlayerId: string;
  label: string;
}

export interface TributeResult {
  relations: TributeRelation[];
  leadPlayerId: string;
  isAntiTribute: boolean;
}

function displayName(player: Player): string {
  return player.name.trim() || player.position;
}

/**
 * 进贡关系推导 — 与 iOS PRD 5.2 一致。
 */
export function calculateTribute(
  rankedPlayerIds: string[],
  players: Player[],
  resultType: ResultType,
  isAntiTribute: boolean,
): TributeResult {
  const playerMap = new Map(players.map((p) => [p.id, p]));
  const ranked = rankedPlayerIds.map((id) => {
    const player = playerMap.get(id);
    if (!player) throw new Error('无效玩家');
    return player;
  });

  const [first, second, , fourth] = ranked;
  const leadPlayerId = first.id;

  if (isAntiTribute) {
    return {
      relations: [],
      leadPlayerId,
      isAntiTribute: true,
    };
  }

  if (resultType === 'double_down') {
    const downstream = ranked.slice(2);
    const targets = [first, second];
    return {
      relations: downstream.map((from, index) => ({
        fromPlayerId: from.id,
        toPlayerId: targets[index]!.id,
        label: `${displayName(from)}(下) 向 ${displayName(targets[index]!)}(游) 进贡最大牌`,
      })),
      leadPlayerId,
      isAntiTribute: false,
    };
  }

  return {
    relations: [
      {
        fromPlayerId: fourth.id,
        toPlayerId: first.id,
        label: `${displayName(fourth)}(下) 向 ${displayName(first)}(头) 进贡最大牌`,
      },
    ],
    leadPlayerId,
    isAntiTribute: false,
  };
}

export function getAntiTributeMessage(leadPlayer: Player): string {
  return `抗贡！${displayName(leadPlayer)} 领出`;
}
