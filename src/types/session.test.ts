import { describe, expect, it } from 'vitest';
import { playingTeamLabel, wildCardLevel } from './session';

describe('session helpers', () => {
  it('wildCardLevel 取自打级方级数', () => {
    expect(wildCardLevel('our', 8, 6)).toBe(8);
    expect(wildCardLevel('opponent', 8, 6)).toBe(6);
  });

  it('playingTeamLabel', () => {
    expect(playingTeamLabel('our')).toBe('南北队');
    expect(playingTeamLabel('opponent')).toBe('东西队');
  });
});
