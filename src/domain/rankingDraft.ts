export const EMPTY_RANKS: Array<string | null> = [null, null, null, null];

function compactRanks(filled: string[]): Array<string | null> {
  const result: Array<string | null> = [...filled];
  while (result.length < 4) {
    result.push(null);
  }
  return result.slice(0, 4);
}

export function toggleRankPlayer(
  ranks: Array<string | null>,
  playerId: string,
): Array<string | null> {
  const filled = ranks.filter((rank): rank is string => rank !== null);
  const existingIndex = filled.indexOf(playerId);

  if (existingIndex >= 0) {
    filled.splice(existingIndex, 1);
    return compactRanks(filled);
  }

  if (filled.length >= 4) {
    return ranks;
  }

  return compactRanks([...filled, playerId]);
}

export function undoLastRank(ranks: Array<string | null>): Array<string | null> {
  const filled = ranks.filter((rank): rank is string => rank !== null);
  if (filled.length === 0) {
    return [...EMPTY_RANKS];
  }

  filled.pop();
  return compactRanks(filled);
}

export function countFilledRanks(ranks: Array<string | null>): number {
  return ranks.filter((rank) => rank !== null).length;
}
