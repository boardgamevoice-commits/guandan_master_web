import { describe, expect, it } from 'vitest';
import { applyLevelChange, calculateLevelChange } from './levelEngine';
import type { Player } from '@/types/game';

const players: Player[] = [
  { id: 'east', name: '东', position: '东', team: 'opponent' },
  { id: 'south', name: '南', position: '南', team: 'our' },
  { id: 'west', name: '西', position: '西', team: 'opponent' },
  { id: 'north', name: '北', position: '北', team: 'our' },
];

describe('calculateLevelChange', () => {
  it('双下：1、2 同队升 3 级', () => {
    const result = calculateLevelChange(['south', 'north', 'east', 'west'], players);
    expect(result.resultType).toBe('double_down');
    expect(result.ourDelta).toBe(3);
    expect(result.opponentDelta).toBe(0);
  });

  it('单下（对手垫底）：1、3 同队升 2 级', () => {
    const result = calculateLevelChange(['south', 'east', 'north', 'west'], players);
    expect(result.resultType).toBe('single_down_opponent');
    expect(result.ourDelta).toBe(2);
  });

  it('单下（己方垫底）：1、4 同队升 1 级', () => {
    const result = calculateLevelChange(['south', 'east', 'west', 'north'], players);
    expect(result.resultType).toBe('single_down_our');
    expect(result.ourDelta).toBe(1);
  });
});

describe('applyLevelChange', () => {
  it('级数不超过 A (14)', () => {
    const change = calculateLevelChange(['south', 'north', 'east', 'west'], players);
    const levels = applyLevelChange(13, 5, change);
    expect(levels.ourLevel).toBe(14);
  });
});
