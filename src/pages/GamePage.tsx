import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { RankPicker } from '@/components/ranking/RankPicker';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { RoundConfirmModal } from '@/components/shared/RoundConfirmModal';
import { calculateTribute } from '@/domain/tributeEngine';
import { getAntiTributeConfirmMessage, isAntiTributeEnabled } from '@/domain/houseRules';
import { levelToLabel } from '@/types/game';
import { getRoundPreview, useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { displayName, teamPlayersLabel } from '@/utils/format';

export function GamePage() {
  const session = useGameStore((state) => state.session);
  const roundDraft = useGameStore((state) => state.roundDraft);
  const createSession = useGameStore((state) => state.createSession);
  const setOpeningLeadPlayer = useGameStore((state) => state.setOpeningLeadPlayer);
  const toggleRankPlayer = useGameStore((state) => state.toggleRankPlayer);
  const undoLastRank = useGameStore((state) => state.undoLastRank);
  const resetRoundDraft = useGameStore((state) => state.resetRoundDraft);
  const setPendingAntiTribute = useGameStore((state) => state.setPendingAntiTribute);
  const setPendingLeadPlayer = useGameStore((state) => state.setPendingLeadPlayer);
  const confirmPendingTributeReview = useGameStore((state) => state.confirmPendingTributeReview);
  const confirmRound = useGameStore((state) => state.confirmRound);
  const undoLastRound = useGameStore((state) => state.undoLastRound);
  const showAntiTributeDialog = useUiStore((state) => state.gameAntiTributeDialogOpen);
  const openAntiTributeDialog = useUiStore((state) => state.openGameAntiTributeDialog);
  const closeAntiTributeDialog = useUiStore((state) => state.closeGameAntiTributeDialog);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  if (!session) {
    return <Navigate to="/setup" replace />;
  }

  const preview = useMemo(
    () => getRoundPreview(session, roundDraft),
    [roundDraft, session],
  );
  const ourTeamNames = useMemo(
    () => teamPlayersLabel(session.players, 'our'),
    [session.players],
  );
  const opponentTeamNames = useMemo(
    () => teamPlayersLabel(session.players, 'opponent'),
    [session.players],
  );

  const playingLevel =
    session.playingTeam === 'our' ? session.ourLevel : session.opponentLevel;
  const pendingReview = session.pendingTributeReview;
  const pendingRound = useMemo(() => {
    if (!pendingReview) return null;
    return session.rounds.find((round) => round.id === pendingReview.roundId) ?? null;
  }, [pendingReview, session.rounds]);
  const pendingTribute = useMemo(() => {
    if (!pendingReview || !pendingRound) return null;
    return calculateTribute(
      pendingRound.ranks,
      session.players,
      pendingRound.resultType,
      pendingReview.isAntiTribute,
    );
  }, [pendingReview, pendingRound, session.players]);
  const pendingLeader = pendingTribute
    ? session.players.find((player) => player.id === pendingTribute.leadPlayerId)
    : null;
  const pendingLeadCandidates = useMemo(() => {
    if (!pendingRound) return [];
    if (pendingRound.resultType === 'double_down') {
      return pendingRound.ranks.slice(2, 4);
    }
    if (pendingRound.resultType === 'single_down_opponent' || pendingRound.resultType === 'single_down_our') {
      return [pendingRound.ranks[3]!];
    }
    return [pendingRound.ranks[0]!];
  }, [pendingRound]);
  const gameEnded = Boolean(session.rounds[session.rounds.length - 1]?.acePassed);
  const shouldChooseOpeningLead = session.rounds.length === 0;
  const rankingLocked = Boolean(gameEnded || (pendingRound && pendingTribute));

  useEffect(() => {
    const key = 'guandan-master:guide:game:v1';
    if (session.rounds.length > 0) return;
    if (window.localStorage.getItem(key) === 'seen') return;
    setShowGuide(true);
  }, [session.rounds.length]);

  return (
    <section className="space-y-4 lg:space-y-5">
      <div className="rounded-2xl border border-dealer/30 bg-dealer/10 px-4 py-3 text-center text-sm font-medium text-amber-900 dark:text-amber-100">
        {gameEnded
          ? `🏁 本场结束：${
              session.playingTeam === 'our' ? ourTeamNames : opponentTeamNames
            } 过 A 成功`
          : `👑 第 ${session.rounds.length + 1} 局：${
              session.playingTeam === 'our' ? ourTeamNames : opponentTeamNames
            }打 ${levelToLabel(playingLevel)}`}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        <div
          className={[
            'rounded-2xl p-4 lg:p-5',
            session.currentDealer === 'our'
              ? 'border-2 border-our bg-our/10 shadow-sm'
              : 'border border-neutral-200 opacity-70 dark:border-neutral-800',
          ].join(' ')}
        >
          <p className="text-center text-xs text-neutral-500">
            {ourTeamNames}
            {session.currentDealer === 'our' ? ' · 先出牌' : ''}
          </p>
          <p className="mt-1 text-center text-5xl font-bold leading-none text-our lg:text-6xl">
            {levelToLabel(session.ourLevel)}
          </p>
        </div>
        <div
          className={[
            'rounded-2xl p-4 lg:p-5',
            session.currentDealer === 'opponent'
              ? 'border-2 border-opponent bg-opponent/10 shadow-sm'
              : 'border border-neutral-200 opacity-70 dark:border-neutral-800',
          ].join(' ')}
        >
          <p className="text-center text-xs text-neutral-500">
            {opponentTeamNames}
            {session.currentDealer === 'opponent' ? ' · 先出牌' : ''}
          </p>
          <p className="mt-1 text-center text-5xl font-bold leading-none text-opponent lg:text-6xl">
            {levelToLabel(session.opponentLevel)}
          </p>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-5">
        <RankPicker
          players={session.players}
          ranks={roundDraft.ranks}
          onTogglePlayer={toggleRankPlayer}
          onUndoLast={undoLastRank}
          onReset={resetRoundDraft}
          disabled={rankingLocked}
        />

        <div className="space-y-4 lg:sticky lg:top-3">
          {!pendingRound && shouldChooseOpeningLead && (
            <div className="space-y-3 rounded-2xl border border-sky-300 bg-sky-50 p-4 text-sm dark:border-sky-700 dark:bg-sky-950/30">
              <p className="font-medium">首局先出牌</p>
              <p className="text-xs text-neutral-500">点击昵称直接选择首局领出玩家</p>
              <div className="grid grid-cols-2 gap-2">
                {session.players.map((player) => (
                  <button
                    key={player.id}
                    type="button"
                    className={[
                      'rounded-lg border px-3 py-2 text-left text-sm',
                      session.currentLeadPlayerId === player.id
                        ? 'border-sky-500 bg-sky-100 text-sky-700 dark:bg-sky-900/40'
                        : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900',
                    ].join(' ')}
                    onClick={() => setOpeningLeadPlayer(player.id)}
                  >
                    {displayName(player)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {pendingRound && pendingTribute && (
            <div className="space-y-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-700 dark:bg-amber-950/30">
              <p className="font-medium">
                上局进贡确认（第 {pendingRound.roundNumber} 局）
              </p>
              {pendingTribute.isAntiTribute ? (
                <p className="text-our">{`抗贡！${
                  pendingLeader ? displayName(pendingLeader) : '头游'
                } 领出`}</p>
              ) : (
                pendingTribute.relations.map((relation) => (
                  <p key={relation.label} className="text-neutral-600 dark:text-neutral-300">
                    · {relation.label}
                  </p>
                ))
              )}
              <div className="space-y-2 text-sm">
                {isAntiTributeEnabled(session.houseRules.antiTributePreset) && (
                  <>
                    <p className="text-neutral-600 dark:text-neutral-300">上局结果</p>
                    <label className="inline-flex items-center gap-2 pr-4">
                      <input
                        type="radio"
                        name="pendingAntiTribute"
                        checked={!pendingReview?.isAntiTribute}
                        onChange={() => setPendingAntiTribute(false)}
                      />
                      未抗贡（默认）
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="pendingAntiTribute"
                        checked={Boolean(pendingReview?.isAntiTribute)}
                        onChange={() => {
                          if (!pendingReview?.isAntiTribute) openAntiTributeDialog();
                        }}
                      />
                      抗贡
                    </label>
                  </>
                )}
                {!pendingReview?.isAntiTribute && pendingLeadCandidates.length > 0 && (
                  <div className="space-y-1 rounded-lg border border-neutral-200 bg-white p-2 dark:border-neutral-700 dark:bg-neutral-900">
                    <p className="text-xs text-neutral-500">先出牌玩家（按标准规则确认）</p>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {pendingLeadCandidates.map((playerId) => {
                        const player = session.players.find((item) => item.id === playerId);
                        if (!player) return null;
                        return (
                          <label key={playerId} className="inline-flex items-center gap-1">
                            <input
                              type="radio"
                              name="pendingLeadPlayer"
                              checked={pendingReview?.leadPlayerId === playerId}
                              onChange={() => setPendingLeadPlayer(playerId)}
                            />
                            {displayName(player)}
                          </label>
                        );
                      })}
                    </div>
                    {pendingRound.resultType === 'double_down' && (
                      <p className="text-[11px] text-neutral-500">
                        双下时请按贡牌大小选择；若同点，选择上游下家。
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="w-full rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white"
                onClick={confirmPendingTributeReview}
              >
                确认上局进贡，开始录入本局名次
              </button>
            </div>
          )}

          <div className="space-y-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900/50">
            <p className="font-medium">进贡指引（文字）</p>
            {preview ? (
              <>
                {preview.antiTributeMessage ? (
                  <p className="text-our">{preview.antiTributeMessage}</p>
                ) : (
                  preview.tributeLines.map((line) => (
                    <p key={line} className="text-neutral-600 dark:text-neutral-300">
                      · {line}
                    </p>
                  ))
                )}
                {isAntiTributeEnabled(session.houseRules.antiTributePreset) && (
                  <p className="text-xs text-neutral-500">
                    抗贡在下一局开始后确认（看牌后再勾选）
                  </p>
                )}
              </>
            ) : (
              <p className="text-neutral-500">录入完整 1–4 名后显示进贡信息</p>
            )}
          </div>

          <button
            type="button"
            className={[
              'w-full rounded-xl py-3 text-sm font-semibold text-white',
              preview && !rankingLocked ? 'bg-our' : 'bg-neutral-300 dark:bg-neutral-700',
            ].join(' ')}
            disabled={!preview || rankingLocked}
            onClick={() => setShowConfirmModal(true)}
          >
            确认并进入下局
          </button>

          <button
            type="button"
            className="w-full rounded-xl border border-neutral-200 px-4 py-2 text-sm text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
            onClick={undoLastRound}
            disabled={session.rounds.length === 0}
          >
            撤回上一局
          </button>

          {gameEnded && (
            <button
              type="button"
              className="w-full rounded-xl border border-our px-4 py-2 text-sm font-semibold text-our"
              onClick={() => setShowRestartConfirm(true)}
            >
              快速开始新对局
            </button>
          )}
        </div>
      </div>

      {showConfirmModal && preview && (
        <RoundConfirmModal
          session={session}
          preview={preview}
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={() => {
            confirmRound();
            setShowConfirmModal(false);
          }}
        />
      )}

      <ConfirmDialog
        open={showAntiTributeDialog}
        title="确认抗贡"
        message={getAntiTributeConfirmMessage(session.houseRules.antiTributePreset)}
        onCancel={closeAntiTributeDialog}
        onConfirm={() => {
          setPendingAntiTribute(true);
          closeAntiTributeDialog();
        }}
      />
      <ConfirmDialog
        open={showRestartConfirm}
        title="确认开始新对局？"
        message="将保留当前玩家与房规，快速重置到开局状态。"
        confirmLabel="开始新对局"
        onCancel={() => setShowRestartConfirm(false)}
        onConfirm={() => {
          const names: { 东: string; 南: string; 西: string; 北: string } = {
            东: '',
            南: '',
            西: '',
            北: '',
          };
          session.players.forEach((player) => {
            names[player.position] = player.name;
          });
          createSession({
            names,
            ourLevel: session.initialOurLevel,
            opponentLevel: session.initialOpponentLevel,
            dealerTeam: session.initialDealerTeam,
            antiTributePreset: session.houseRules.antiTributePreset,
            aceRequiresDoubleDown: session.houseRules.aceRequiresDoubleDown,
          });
          setShowRestartConfirm(false);
        }}
      />
      {showGuide && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/55 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 text-sm shadow-xl dark:bg-neutral-900">
            <h3 className="text-base font-semibold">新手引导</h3>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300">
              请按出完顺序点击 4 位玩家，下方会显示名次。点错可再次点击取消。
            </p>
            <div className="mt-4">
              <button
                type="button"
                className="w-full rounded-lg bg-our px-3 py-2 font-semibold text-white"
                onClick={() => {
                  window.localStorage.setItem('guandan-master:guide:game:v1', 'seen');
                  setShowGuide(false);
                }}
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
