import { evaluateAce } from '@/domain/aceRules';
import { applyLevelChange, calculateLevelChange } from '@/domain/levelEngine';
import { calculateTribute } from '@/domain/tributeEngine';
import type { GameRoundRecord, GameSession, Player, Team } from '@/types/game';
import type { RoundDraft } from '@/types/round';
import { teamPlayersLabel } from '@/utils/format';

export interface RoundPreview {
  roundNumber: number;
  ranks: Array<{ rank: number; player: Player }>;
  tributeLines: string[];
  antiTributeMessage: string | null;
  resultLabel: string;
  nextOurLevel: number;
  nextOpponentLevel: number;
  nextDealer: Team;
  nextLeadPlayerId: string;
  winner: Team;
  acePassed: boolean;
  aceMessage: string | null;
}

export function canSettleRound(draft: RoundDraft): draft is RoundDraft & { ranks: string[] } {
  return draft.ranks.every((rank) => typeof rank === 'string');
}

export function getCurrentWildCard(session: GameSession): number {
  return session.playingTeam === 'our' ? session.ourLevel : session.opponentLevel;
}

export function previewRound(session: GameSession, draft: RoundDraft): RoundPreview | null {
  if (!canSettleRound(draft)) return null;
  const rankedIds = draft.ranks as string[];

  const change = calculateLevelChange(rankedIds, session.players);
  const nextLevels = applyLevelChange(session.ourLevel, session.opponentLevel, change);
  const tribute = calculateTribute(
    rankedIds,
    session.players,
    change.resultType,
    false,
  );

  const leader = findPlayerById(session.players, tribute.leadPlayerId);
  const winnerLabel = `${teamPlayersLabel(session.players, change.winner)}队`;
  const delta = change.winner === 'our' ? change.ourDelta : change.opponentDelta;
  const ace = evaluateAce({
    winner: change.winner,
    resultType: change.resultType,
    beforeOurLevel: session.ourLevel,
    beforeOpponentLevel: session.opponentLevel,
    afterOurLevel: nextLevels.ourLevel,
    afterOpponentLevel: nextLevels.opponentLevel,
    houseRules: session.houseRules,
  });

  return {
    roundNumber: session.rounds.length + 1,
    ranks: rankedIds.map((playerId, idx) => ({
      rank: idx + 1,
      player: findPlayerById(session.players, playerId),
    })),
    tributeLines: tribute.relations.map((relation) => relation.label),
    antiTributeMessage: null,
    resultLabel: `${winnerLabel}${change.resultType === 'double_down' ? '双下胜' : '胜'} (+${delta})`,
    nextOurLevel: nextLevels.ourLevel,
    nextOpponentLevel: nextLevels.opponentLevel,
    nextDealer: leader.team,
    nextLeadPlayerId: leader.id,
    winner: change.winner,
    acePassed: ace.passed,
    aceMessage: localizeAceMessage(ace.message, session.players),
  };
}

export function settleRound(
  session: GameSession,
  draft: RoundDraft,
): { nextSession: GameSession; roundRecord: GameRoundRecord; preview: RoundPreview } | null {
  const preview = previewRound(session, draft);
  if (!preview || !canSettleRound(draft)) return null;
  const rankedIds = draft.ranks as string[];

  const roundRecord: GameRoundRecord = {
    id: crypto.randomUUID(),
    roundNumber: preview.roundNumber,
    date: new Date().toISOString(),
    ranks: [...rankedIds],
    resultType: calculateLevelChange(rankedIds, session.players).resultType,
    isAntiTribute: false,
    leadPlayerId: preview.nextLeadPlayerId,
    acePassed: preview.acePassed,
    currentWildCard: getCurrentWildCard(session),
    ourLevelSnapshot: preview.nextOurLevel,
    opponentLevelSnapshot: preview.nextOpponentLevel,
  };

  return {
    roundRecord,
    preview,
    nextSession: {
      ...session,
      ourLevel: preview.nextOurLevel,
      opponentLevel: preview.nextOpponentLevel,
      playingTeam: preview.winner,
      currentDealer: preview.nextDealer,
      currentLeadPlayerId: preview.nextLeadPlayerId,
      rounds: [...session.rounds, roundRecord],
      pendingTributeReview: null,
      updatedAt: new Date().toISOString(),
    },
  };
}

export function undoLastRound(session: GameSession): GameSession | null {
  if (session.rounds.length === 0) return null;
  return replaySessionRounds(session, session.rounds.slice(0, -1));
}

export function deleteRound(session: GameSession, roundId: string): GameSession | null {
  const rounds = session.rounds.filter((round) => round.id !== roundId);
  if (rounds.length === session.rounds.length) return null;
  return replaySessionRounds(session, rounds);
}

function replaySessionRounds(session: GameSession, rounds: GameRoundRecord[]): GameSession {
  let nextSession: GameSession = {
    ...session,
    rounds: [],
    ourLevel: session.initialOurLevel,
    opponentLevel: session.initialOpponentLevel,
    playingTeam: session.initialDealerTeam,
    currentDealer: session.initialDealerTeam,
    currentLeadPlayerId: session.currentLeadPlayerId,
    pendingTributeReview: null,
  };

  const replayedRounds = rounds.map((round, index) => {
    const change = calculateLevelChange(round.ranks, nextSession.players);
    const nextLevels = applyLevelChange(nextSession.ourLevel, nextSession.opponentLevel, change);
    const ace = evaluateAce({
      winner: change.winner,
      resultType: change.resultType,
      beforeOurLevel: nextSession.ourLevel,
      beforeOpponentLevel: nextSession.opponentLevel,
      afterOurLevel: nextLevels.ourLevel,
      afterOpponentLevel: nextLevels.opponentLevel,
      houseRules: nextSession.houseRules,
    });
    const leader = resolveRoundLeadPlayer(nextSession.players, round);

    const replayed: GameRoundRecord = {
      ...round,
      roundNumber: index + 1,
      resultType: change.resultType,
      acePassed: ace.passed,
      currentWildCard: getCurrentWildCard(nextSession),
      ourLevelSnapshot: nextLevels.ourLevel,
      opponentLevelSnapshot: nextLevels.opponentLevel,
    };

    nextSession = {
      ...nextSession,
      ourLevel: nextLevels.ourLevel,
      opponentLevel: nextLevels.opponentLevel,
      playingTeam: change.winner,
      currentDealer: leader.team,
      currentLeadPlayerId: leader.id,
    };

    return replayed;
  });

  return {
    ...nextSession,
    rounds: replayedRounds,
    updatedAt: new Date().toISOString(),
  };
}

function findPlayerById(players: Player[], playerId: string): Player {
  const player = players.find((candidate) => candidate.id === playerId);
  if (!player) throw new Error('无效玩家');
  return player;
}

function localizeAceMessage(message: string | null, players: Player[]): string | null {
  if (!message) return null;
  return message
    .replaceAll('南北队', `${teamPlayersLabel(players, 'our')}队`)
    .replaceAll('东西队', `${teamPlayersLabel(players, 'opponent')}队`);
}

function resolveRoundLeadPlayer(
  players: Player[],
  round: Pick<GameRoundRecord, 'ranks' | 'resultType' | 'isAntiTribute'> &
    Partial<Pick<GameRoundRecord, 'leadPlayerId'>>,
): Player {
  if (round.leadPlayerId) {
    return findPlayerById(players, round.leadPlayerId);
  }
  if (round.isAntiTribute) {
    return findPlayerById(players, round.ranks[0]!);
  }
  if (round.resultType === 'double_down') {
    return findPlayerById(players, round.ranks[2]!);
  }
  return findPlayerById(players, round.ranks[3]!);
}
