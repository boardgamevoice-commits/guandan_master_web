import { describe, expect, it } from 'vitest';
import { validateHand, type CardInput } from './cardValidator';

function c(suit: CardInput['suit'], rank: CardInput['rank']): CardInput {
  return { suit, rank };
}

describe('validateHand', () => {
  it('识别对子', () => {
    const result = validateHand([c('spade', 8), c('club', 8)], 7);
    expect(result.valid).toBe(true);
    expect(result.handType).toBe('pair');
  });

  it('逢人配可补成对子', () => {
    const result = validateHand([c('heart', 8), c('club', 9)], 8);
    expect(result.valid).toBe(true);
  });

  it('识别顺子', () => {
    const result = validateHand(
      [c('spade', 7), c('club', 8), c('diamond', 9), c('heart', 10), c('spade', 11)],
      5,
    );
    expect(result.valid).toBe(true);
    expect(result.handType).toBe('straight');
  });

  it('逢人配可补成三带二', () => {
    const result = validateHand(
      [c('spade', 9), c('club', 9), c('diamond', 9), c('club', 7), c('heart', 8)],
      8,
    );
    expect(result.valid).toBe(true);
    expect(result.handType).toBe('full_house');
  });

  it('五张同点（含逢人配）优先识别炸弹', () => {
    const result = validateHand(
      [c('spade', 9), c('club', 9), c('diamond', 9), c('heart', 9), c('heart', 8)],
      8,
    );
    expect(result.valid).toBe(true);
    expect(result.handType).toBe('bomb');
  });

  it('识别木板', () => {
    const result = validateHand(
      [c('spade', 3), c('club', 3), c('spade', 4), c('club', 4), c('spade', 5), c('club', 5)],
      2,
    );
    expect(result.valid).toBe(true);
    expect(result.handType).toBe('pair_sequence');
  });

  it('识别钢板', () => {
    const result = validateHand(
      [c('spade', 7), c('club', 7), c('diamond', 7), c('spade', 8), c('club', 8), c('diamond', 8)],
      2,
    );
    expect(result.valid).toBe(true);
    expect(result.handType).toBe('triple_sequence');
  });

  it('识别同花顺', () => {
    const result = validateHand(
      [c('spade', 7), c('spade', 8), c('spade', 9), c('spade', 10), c('spade', 11)],
      2,
    );
    expect(result.valid).toBe(true);
    expect(result.handType).toBe('flush_straight');
  });

  it('识别四大天王', () => {
    const result = validateHand(
      [c('joker', 'SJ'), c('joker', 'SJ'), c('joker', 'BJ'), c('joker', 'BJ')],
      2,
    );
    expect(result.valid).toBe(true);
    expect(result.handType).toBe('four_jokers');
  });

  it('非法牌型', () => {
    const result = validateHand([c('spade', 3), c('club', 7), c('diamond', 11)], 2);
    expect(result.valid).toBe(false);
  });
});
