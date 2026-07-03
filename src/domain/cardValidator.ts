export type CardSuit = 'spade' | 'heart' | 'diamond' | 'club' | 'joker';
export type CardRank = number | 'SJ' | 'BJ';

export interface CardInput {
  suit: CardSuit;
  rank: CardRank;
}

export interface ValidationResult {
  valid: boolean;
  handType?:
    | 'single'
    | 'pair'
    | 'triple'
    | 'full_house'
    | 'straight'
    | 'pair_sequence'
    | 'triple_sequence'
    | 'flush_straight'
    | 'bomb'
    | 'four_jokers';
  displayName?: string;
  error?: string;
}

export function validateHand(cards: CardInput[], wildLevel: number): ValidationResult {
  if (cards.length === 0) {
    return { valid: false, error: '请选择至少一张牌' };
  }

  if (isFourJokers(cards)) {
    return { valid: true, handType: 'four_jokers', displayName: '四大天王' };
  }

  const { wildcards, natural } = splitWildcards(cards, wildLevel);
  const wildcardCount = wildcards.length;
  const counts = countRanks(natural);
  const countValues = [...counts.values()].sort((a, b) => b - a);

  if (cards.length === 1) {
    return { valid: true, handType: 'single', displayName: '单张' };
  }

  if (cards.length === 2 && canMakeSameOfAKind(countValues, wildcardCount, 2)) {
    return { valid: true, handType: 'pair', displayName: '对子' };
  }

  if (cards.length === 3 && canMakeSameOfAKind(countValues, wildcardCount, 3)) {
    return { valid: true, handType: 'triple', displayName: '三同张' };
  }

  if (cards.length >= 4 && canMakeSameOfAKind(countValues, wildcardCount, cards.length)) {
    return { valid: true, handType: 'bomb', displayName: `${cards.length}炸` };
  }

  if (cards.length === 5 && canMakeFullHouse(counts, wildcardCount)) {
    return { valid: true, handType: 'full_house', displayName: '三带二' };
  }

  if (wildcardCount === 0 && cards.length >= 5 && isFlushStraight(natural)) {
    return { valid: true, handType: 'flush_straight', displayName: '同花顺' };
  }

  if (cards.length === 6 && wildcardCount === 0 && isPairSequence(natural)) {
    return { valid: true, handType: 'pair_sequence', displayName: '木板' };
  }

  if (cards.length === 6 && wildcardCount === 0 && isTripleSequence(natural)) {
    return { valid: true, handType: 'triple_sequence', displayName: '钢板' };
  }

  if (cards.length >= 5 && isStraight(natural, wildcardCount)) {
    return { valid: true, handType: 'straight', displayName: '顺子' };
  }

  return { valid: false, error: '非法牌型' };
}

function splitWildcards(cards: CardInput[], wildLevel: number) {
  const wildcards: CardInput[] = [];
  const natural: CardInput[] = [];
  for (const card of cards) {
    if (card.suit === 'heart' && card.rank === wildLevel) {
      wildcards.push(card);
    } else {
      natural.push(card);
    }
  }
  return { wildcards, natural };
}

function countRanks(cards: CardInput[]): Map<CardRank, number> {
  const counts = new Map<CardRank, number>();
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) ?? 0) + 1);
  }
  return counts;
}

function canMakeSameOfAKind(
  sortedCountsDesc: number[],
  wildcardCount: number,
  targetCount: number,
): boolean {
  const top = sortedCountsDesc[0] ?? 0;
  return top + wildcardCount >= targetCount;
}

function canMakeFullHouse(counts: Map<CardRank, number>, wildcardCount: number): boolean {
  const naturalRanks = [...counts.keys()];
  const candidates: Array<string | CardRank> = [...naturalRanks, '__triple_new__', '__pair_new__'];

  for (const tripleRank of candidates) {
    for (const pairRank of candidates) {
      if (pairRank === tripleRank) continue;
      const tripleCount = typeof tripleRank === 'string' ? 0 : (counts.get(tripleRank) ?? 0);
      const pairCount = typeof pairRank === 'string' ? 0 : (counts.get(pairRank) ?? 0);
      const needed = Math.max(0, 3 - tripleCount) + Math.max(0, 2 - pairCount);
      if (needed <= wildcardCount) return true;
    }
  }

  return false;
}

function isStraight(natural: CardInput[], wildcardCount: number): boolean {
  if (natural.some((card) => card.rank === 'SJ' || card.rank === 'BJ' || card.rank === 2)) {
    return false;
  }
  const ranks = [...new Set(natural.map((card) => Number(card.rank)))].sort((a, b) => a - b);
  if (ranks.length !== natural.length) return false;
  if (ranks.length === 0) return true;

  let missing = 0;
  for (let i = 1; i < ranks.length; i += 1) {
    missing += ranks[i]! - ranks[i - 1]! - 1;
  }

  return missing <= wildcardCount;
}

function isFourJokers(cards: CardInput[]): boolean {
  if (cards.length !== 4) return false;
  const small = cards.filter((card) => card.rank === 'SJ').length;
  const big = cards.filter((card) => card.rank === 'BJ').length;
  return small === 2 && big === 2;
}

function isFlushStraight(cards: CardInput[]): boolean {
  if (cards.some((card) => typeof card.rank !== 'number')) return false;
  const suits = new Set(cards.map((card) => card.suit));
  if (suits.size !== 1 || suits.has('joker')) return false;
  return isStraight(cards, 0);
}

function isPairSequence(cards: CardInput[]): boolean {
  if (cards.some((card) => typeof card.rank !== 'number')) return false;
  const counts = countRanks(cards);
  const ranks = [...counts.keys()]
    .map((rank) => Number(rank))
    .sort((a, b) => a - b);
  if (ranks.length !== 3) return false;
  if ([...counts.values()].some((count) => count !== 2)) return false;
  return ranks[1]! === ranks[0]! + 1 && ranks[2]! === ranks[1]! + 1;
}

function isTripleSequence(cards: CardInput[]): boolean {
  if (cards.some((card) => typeof card.rank !== 'number')) return false;
  const counts = countRanks(cards);
  const ranks = [...counts.keys()]
    .map((rank) => Number(rank))
    .sort((a, b) => a - b);
  if (ranks.length !== 2) return false;
  if ([...counts.values()].some((count) => count !== 3)) return false;
  return ranks[1]! === ranks[0]! + 1;
}
