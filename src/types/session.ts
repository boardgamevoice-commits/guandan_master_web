import type { Team } from '@/types/game';

/**
 * 当前打级方（升级方）的级数 — 即逢人配（红心级牌）的点数来源。
 */
export function wildCardLevel(
  playingTeam: Team,
  ourLevel: number,
  opponentLevel: number,
): number {
  return playingTeam === 'our' ? ourLevel : opponentLevel;
}

/**
 * 轮次横幅文案中的打级方队名。
 */
export function playingTeamLabel(team: Team): string {
  return team === 'our' ? '南北队' : '东西队';
}
