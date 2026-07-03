import { describe, expect, it } from 'vitest';
import { evaluateAce } from './aceRules';
import type { HouseRules } from '@/types/game';

const defaultRules: HouseRules = {
  aceRequiresDoubleDown: true,
  antiTributePreset: 'combined_double_joker',
};

describe('evaluateAce', () => {
  it('未到 A 不触发过 A 判定', () => {
    const result = evaluateAce({
      winner: 'our',
      resultType: 'double_down',
      beforeOurLevel: 8,
      beforeOpponentLevel: 6,
      afterOurLevel: 11,
      afterOpponentLevel: 6,
      houseRules: defaultRules,
    });
    expect(result.passed).toBe(false);
    expect(result.message).toBeNull();
  });

  it('首次到 A 提示继续争过 A', () => {
    const result = evaluateAce({
      winner: 'our',
      resultType: 'double_down',
      beforeOurLevel: 13,
      beforeOpponentLevel: 6,
      afterOurLevel: 14,
      afterOpponentLevel: 6,
      houseRules: defaultRules,
    });
    expect(result.passed).toBe(false);
    expect(result.message).toContain('到达 A');
  });

  it('房规要求双下时，非双下不过 A', () => {
    const result = evaluateAce({
      winner: 'our',
      resultType: 'single_down_opponent',
      beforeOurLevel: 14,
      beforeOpponentLevel: 10,
      afterOurLevel: 14,
      afterOpponentLevel: 10,
      houseRules: defaultRules,
    });
    expect(result.passed).toBe(false);
  });
});
