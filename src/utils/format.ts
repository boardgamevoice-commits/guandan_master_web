import type { GameRoundRecord, GameSession, Player, ResultType, Team } from '@/types/game';

export function displayName(player: Player): string {
  return player.name.trim() || player.position;
}

export function teamLabel(team: Team): string {
  return team === 'our' ? '南北队' : '东西队';
}

export function teamPlayersLabel(players: Player[], team: Team): string {
  const names = players
    .filter((player) => player.team === team)
    .map((player) => displayName(player));
  return names.length > 0 ? names.join(' / ') : teamLabel(team);
}

export function resultTypeLabel(resultType: ResultType): string {
  if (resultType === 'double_down') return '双下';
  if (resultType === 'single_down_opponent') return '单下(+2)';
  return '单下(+1)';
}

export function formatPlainTextReport(session: GameSession): string {
  const lines: string[] = [];
  const playerMap = new Map(session.players.map((player) => [player.id, player]));

  lines.push('掼蛋大师 · 战报');
  lines.push(`共 ${session.rounds.length} 局`);
  lines.push('');

  for (const round of session.rounds) {
    lines.push(`第 ${round.roundNumber} 局 · ${resultTypeLabel(round.resultType)}`);
    round.ranks.forEach((playerId, idx) => {
      const player = playerMap.get(playerId);
      if (!player) return;
      lines.push(`${idx + 1}. ${displayName(player)}（${player.position}）`);
    });
    lines.push(
      `级数：南北 ${round.ourLevelSnapshot} / 东西 ${round.opponentLevelSnapshot}`,
    );
    lines.push('');
  }

  return lines.join('\n');
}

export function formatPlainTextRound(session: GameSession, round: GameRoundRecord): string {
  const playerMap = new Map(session.players.map((player) => [player.id, player]));
  const lines: string[] = [];
  lines.push(`掼蛋大师 · 第 ${round.roundNumber} 局`);
  lines.push(`结果：${resultTypeLabel(round.resultType)}`);
  lines.push('');
  round.ranks.forEach((playerId, idx) => {
    const player = playerMap.get(playerId);
    if (!player) return;
    lines.push(`${idx + 1}. ${displayName(player)}（${player.position}）`);
  });
  lines.push('');
  lines.push(`级数：南北 ${round.ourLevelSnapshot} / 东西 ${round.opponentLevelSnapshot}`);
  return lines.join('\n');
}
