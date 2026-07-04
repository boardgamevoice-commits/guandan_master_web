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
import { displayName, teamLabel } from '@/utils/format';

export function GamePage() {
  const session = useGameStore((state) => state.session);
  const roundDraft = useGameStore((state) => state.roundDraft);
  const toggleRankPlayer = useGameStore((state) => state.toggleRankPlayer);
  const undoLastRank = useGameStore((state) => state.undoLastRank);
  const resetRoundDraft = useGameStore((state) => state.resetRoundDraft);
  const setPendingAntiTribute = useGameStore((state) => state.setPendingAntiTribute);
  const confirmPendingTributeReview = useGameStore((state) => state.confirmPendingTributeReview);
  const confirmRound = useGameStore((state) => state.confirmRound);
  const undoLastRound = useGameStore((state) => state.undoLastRound);
  const showAntiTributeDialog = useUiStore((state) => state.gameAntiTributeDialogOpen);
  const openAntiTributeDialog = useUiStore((state) => state.openGameAntiTributeDialog);
  const closeAntiTributeDialog = useUiStore((state) => state.closeGameAntiTributeDialog);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  if (!session) {
    return <Navigate to="/setup" replace />;
  }

  const preview = useMemo(
    () => getRoundPreview(session, roundDraft),
    [roundDraft, session],
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
  const rankingLocked = Boolean(pendingRound && pendingTribute);

  useEffect(() => {
    const key = 'guandan-master:guide:game:v1';
    if (session.rounds.length > 0) return;
    if (window.localStorage.getItem(key) === 'seen') return;
    setShowGuide(true);
  }, [session.rounds.length]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-dealer/30 bg-dealer/10 px-4 py-3 text-center text-sm font-medium text-amber-900 dark:text-amber-100">
        👑 第 {session.rounds.length + 1} 局：{teamLabel(session.playingTeam)}打{' '}
        {levelToLabel(playingLevel)}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div
          className={[
            'rounded-2xl p-4',
            session.currentDealer === 'our'
              ? 'border-2 border-our bg-our/10 shadow-sm'
              : 'border border-neutral-200 opacity-70 dark:border-neutral-800',
          ].join(' ')}
        >
          <p className="text-xs text-neutral-500">
            我方 · 南北{session.currentDealer === 'our' ? ' · 先出牌' : ''}
          </p>
          <p className="mt-1 text-3xl font-bold text-our">{levelToLabel(session.ourLevel)}</p>
        </div>
        <div
          className={[
            'rounded-2xl p-4',
            session.currentDealer === 'opponent'
              ? 'border-2 border-opponent bg-opponent/10 shadow-sm'
              : 'border border-neutral-200 opacity-70 dark:border-neutral-800',
          ].join(' ')}
        >
          <p className="text-xs text-neutral-500">
            对方 · 东西{session.currentDealer === 'opponent' ? ' · 先出牌' : ''}
          </p>
          <p className="mt-1 text-3xl font-bold text-opponent">
            {levelToLabel(session.opponentLevel)}
          </p>
        </div>
      </div>

      <RankPicker
        players={session.players}
        ranks={roundDraft.ranks}
        onTogglePlayer={toggleRankPlayer}
        onUndoLast={undoLastRank}
        onReset={resetRoundDraft}
        disabled={rankingLocked}
      />

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
          {isAntiTributeEnabled(session.houseRules.antiTributePreset) && (
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={pendingReview?.isAntiTribute ?? false}
                onChange={(event) => {
                  const checked = event.target.checked;
                  if (!checked) {
                    setPendingAntiTribute(false);
                    return;
                  }
                  openAntiTributeDialog();
                }}
              />
              抗贡（下一局摸牌后确认）
            </label>
          )}
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
