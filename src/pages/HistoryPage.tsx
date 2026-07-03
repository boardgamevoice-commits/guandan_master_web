import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RoundDetailModal } from '@/components/history/RoundDetailModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { levelToLabel } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import { formatPlainTextReport, formatPlainTextRound, resultTypeLabel } from '@/utils/format';

export function HistoryPage() {
  const session = useGameStore((state) => state.session);
  const clearHistory = useGameStore((state) => state.clearHistory);
  const deleteRound = useGameStore((state) => state.deleteRound);
  const showToast = useUiStore((state) => state.showToast);
  const showClearDialog = useUiStore((state) => state.historyClearDialogOpen);
  const openClearDialog = useUiStore((state) => state.openHistoryClearDialog);
  const closeClearDialog = useUiStore((state) => state.closeHistoryClearDialog);
  const [selectedRoundId, setSelectedRoundId] = useState<string | null>(null);
  const [pendingDeleteRoundId, setPendingDeleteRoundId] = useState<string | null>(null);

  const timeline = (session?.rounds ?? []).map((round, index, arr) => {
    const prev = arr[index - 1];
    return {
      round,
      beforeOur: prev?.ourLevelSnapshot ?? session!.initialOurLevel,
      beforeOpponent: prev?.opponentLevelSnapshot ?? session!.initialOpponentLevel,
    };
  });
  const rounds = [...timeline].reverse();
  const selectedRound = rounds.find((item) => item.round.id === selectedRoundId)?.round ?? null;

  const shareReport = async () => {
    if (!session || session.rounds.length === 0) return;
    const text = formatPlainTextReport(session);

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: '掼蛋大师战报', text });
        showToast('已唤起系统分享');
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      showToast('已复制到剪贴板');
    } catch {
      showToast('复制失败，请手动复制');
    }
  };

  const copySingleRound = async () => {
    if (!session || !selectedRound) return;
    try {
      await navigator.clipboard.writeText(formatPlainTextRound(session, selectedRound));
      showToast('已复制本局战报');
    } catch {
      showToast('复制失败，请手动复制');
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">历史记录</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Phase 1 最小集：历史列表 + 纯文本复制战报。
        </p>
      </div>

      {rounds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
          暂无历史记录，先去
          {' '}
          <Link to="/game" className="text-our underline">
            记分
          </Link>
          {' '}
          吧。
        </div>
      ) : (
        <div className="space-y-2">
          {rounds.map(({ round, beforeOur, beforeOpponent }) => (
            <article
              key={round.id}
              className="rounded-2xl border border-neutral-200 p-4 text-sm dark:border-neutral-800"
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => setSelectedRoundId(round.id)}
              >
                <p className="font-medium">第 {round.roundNumber} 局</p>
                <p className="mt-1 text-neutral-500">
                  {resultTypeLabel(round.resultType)} ·
                  {' '}
                  南北 {levelToLabel(beforeOur)}→{levelToLabel(round.ourLevelSnapshot)} / 东西{' '}
                  {levelToLabel(beforeOpponent)}→{levelToLabel(round.opponentLevelSnapshot)}
                </p>
              </button>
            </article>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="rounded-xl bg-our px-4 py-2 text-sm font-semibold text-white disabled:bg-neutral-300 dark:disabled:bg-neutral-700"
          onClick={() => void shareReport()}
          disabled={rounds.length === 0}
        >
          分享整场
        </button>
        <button
          type="button"
          className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600 disabled:opacity-50"
          onClick={openClearDialog}
          disabled={rounds.length === 0}
        >
          清空历史
        </button>
      </div>
      {selectedRound && session && (
        <RoundDetailModal
          round={selectedRound}
          players={session.players}
          onCopy={() => void copySingleRound()}
          onDelete={() => setPendingDeleteRoundId(selectedRound.id)}
          onClose={() => setSelectedRoundId(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDeleteRoundId)}
        title="确认删除本局？"
        message="删除后无法恢复。"
        confirmLabel="删除"
        onCancel={() => setPendingDeleteRoundId(null)}
        onConfirm={() => {
          if (!pendingDeleteRoundId) return;
          deleteRound(pendingDeleteRoundId);
          if (selectedRoundId === pendingDeleteRoundId) setSelectedRoundId(null);
          setPendingDeleteRoundId(null);
          showToast('已删除本局记录');
        }}
      />

      <ConfirmDialog
        open={showClearDialog}
        title="确认清空历史？"
        message="该操作不可撤销。"
        confirmLabel="确认清空"
        onCancel={closeClearDialog}
        onConfirm={() => {
          clearHistory();
          closeClearDialog();
        }}
      />
    </section>
  );
}
