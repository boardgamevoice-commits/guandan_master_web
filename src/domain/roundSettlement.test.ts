import { describe, expect, it } from 'vitest';
import { deleteRound, settleRound, undoLastRound } from '@/domain/roundSettlement';
import type { GameSession } from '@/types/game';
import type { RoundDraft } from '@/types/round';

function createSession(): GameSession {
  const now = new Date().toISOString();
  return {
    id: 'session-1',
    players: [
      { id: 'east', position: '东', name: '东', team: 'opponent' },
      { id: 'south', position: '南', name: '南', team: 'our' },
      { id: 'west', position: '西', name: '西', team: 'opponent' },
      { id: 'north', position: '北', name: '北', team: 'our' },
    ],
    initialOurLevel: 2,
    initialOpponentLevel: 2,
    initialDealerTeam: 'our',
    ourLevel: 2,
    opponentLevel: 2,
    playingTeam: 'our',
    currentDealer: 'our',
    currentLeadPlayerId: 'south',
    houseRules: {
      antiTributePreset: 'combined_double_joker',
      aceRequiresDoubleDown: true,
    },
    rounds: [],
    pendingTributeReview: null,
    createdAt: now,
    updatedAt: now,
  };
}

function draft(ranks: string[]): RoundDraft {
  return { ranks };
}

describe('undoLastRound', () => {
  it('无历史时返回 null', () => {
    expect(undoLastRound(createSession())).toBeNull();
  });

  it('撤回首局后恢复到初始状态', () => {
    const session = createSession();
    const settled = settleRound(session, draft(['south', 'north', 'east', 'west']));
    expect(settled).not.toBeNull();

    const undone = undoLastRound(settled!.nextSession);
    expect(undone).not.toBeNull();
    expect(undone!.rounds).toHaveLength(0);
    expect(undone!.ourLevel).toBe(2);
    expect(undone!.opponentLevel).toBe(2);
    expect(undone!.playingTeam).toBe('our');
    expect(undone!.currentDealer).toBe('our');
  });

  it('多局撤回时恢复到上一局快照', () => {
    const round1 = settleRound(createSession(), draft(['south', 'north', 'east', 'west']));
    expect(round1).not.toBeNull();
    const round2 = settleRound(
      round1!.nextSession,
      draft(['east', 'south', 'west', 'north']),
    );
    expect(round2).not.toBeNull();

    const undone = undoLastRound(round2!.nextSession);
    expect(undone).not.toBeNull();
    expect(undone!.rounds).toHaveLength(1);
    expect(undone!.ourLevel).toBe(round1!.nextSession.ourLevel);
    expect(undone!.opponentLevel).toBe(round1!.nextSession.opponentLevel);
    expect(undone!.playingTeam).toBe(round1!.nextSession.playingTeam);
    expect(undone!.currentDealer).toBe(round1!.nextSession.currentDealer);
  });
});

describe('deleteRound', () => {
  it('删除不存在的局返回 null', () => {
    expect(deleteRound(createSession(), 'missing-round')).toBeNull();
  });

  it('删除中间局后会重放并修正级数快照', () => {
    const round1 = settleRound(createSession(), draft(['south', 'north', 'east', 'west']));
    expect(round1).not.toBeNull();
    const round2 = settleRound(
      round1!.nextSession,
      draft(['east', 'west', 'south', 'north']),
    );
    expect(round2).not.toBeNull();
    const round3 = settleRound(
      round2!.nextSession,
      draft(['south', 'east', 'north', 'west']),
    );
    expect(round3).not.toBeNull();

    const deleted = deleteRound(round3!.nextSession, round2!.roundRecord.id);
    expect(deleted).not.toBeNull();
    expect(deleted!.rounds).toHaveLength(2);
    expect(deleted!.rounds[0]!.roundNumber).toBe(1);
    expect(deleted!.rounds[1]!.roundNumber).toBe(2);
    expect(deleted!.ourLevel).toBe(7);
    expect(deleted!.opponentLevel).toBe(2);
    expect(deleted!.rounds[1]!.ourLevelSnapshot).toBe(7);
    expect(deleted!.rounds[1]!.opponentLevelSnapshot).toBe(2);
  });
});
