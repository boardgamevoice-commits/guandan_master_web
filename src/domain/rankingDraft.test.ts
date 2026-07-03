import { describe, expect, it } from 'vitest';
import {
  EMPTY_RANKS,
  countFilledRanks,
  toggleRankPlayer,
  undoLastRank,
} from '@/domain/rankingDraft';

describe('toggleRankPlayer', () => {
  it('按点击顺序写入名次', () => {
    let ranks = [...EMPTY_RANKS];
    ranks = toggleRankPlayer(ranks, 'south');
    ranks = toggleRankPlayer(ranks, 'north');
    expect(ranks).toEqual(['south', 'north', null, null]);
  });

  it('反选中间一名时后续名次前移', () => {
    let ranks = toggleRankPlayer(
      toggleRankPlayer(
        toggleRankPlayer(toggleRankPlayer([...EMPTY_RANKS], 'a'), 'b'),
        'c',
      ),
      'd',
    );
    ranks = toggleRankPlayer(ranks, 'b');
    expect(ranks).toEqual(['a', 'c', 'd', null]);
  });

  it('反选后再点会补到下一个空位', () => {
    let ranks = toggleRankPlayer(
      toggleRankPlayer(
        toggleRankPlayer(toggleRankPlayer([...EMPTY_RANKS], 'a'), 'b'),
        'c',
      ),
      'd',
    );
    ranks = toggleRankPlayer(ranks, 'b');
    ranks = toggleRankPlayer(ranks, 'b');
    expect(ranks).toEqual(['a', 'c', 'd', 'b']);
  });

  it('已满 4 人时忽略新点击', () => {
    let ranks = toggleRankPlayer(
      toggleRankPlayer(
        toggleRankPlayer(toggleRankPlayer([...EMPTY_RANKS], 'a'), 'b'),
        'c',
      ),
      'd',
    );
    ranks = toggleRankPlayer(ranks, 'e');
    expect(ranks).toEqual(['a', 'b', 'c', 'd']);
  });
});

describe('undoLastRank', () => {
  it('移除最后一名', () => {
    const ranks = undoLastRank(['a', 'b', 'c', null]);
    expect(ranks).toEqual(['a', 'b', null, null]);
  });

  it('空态保持不变', () => {
    expect(undoLastRank([...EMPTY_RANKS])).toEqual([...EMPTY_RANKS]);
  });
});

describe('countFilledRanks', () => {
  it('统计已录入人数', () => {
    expect(countFilledRanks(['a', 'b', null, null])).toBe(2);
  });
});
