import { levelToLabel, type GameSession } from '@/types/game';
import type { RoundPreview } from '@/domain/roundSettlement';
import { displayName, teamPlayersLabel } from '@/utils/format';

interface RoundConfirmModalProps {
  session: GameSession;
  preview: RoundPreview;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RoundConfirmModal({
  session,
  preview,
  onCancel,
  onConfirm,
}: RoundConfirmModalProps) {
  const ourTeamNames = teamPlayersLabel(session.players, 'our');
  const opponentTeamNames = teamPlayersLabel(session.players, 'opponent');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-neutral-900">
        <h3 className="text-base font-semibold">确认进入下局</h3>
        <p className="mt-2 text-sm text-neutral-500">
          第 {preview.roundNumber} 局 · {preview.resultLabel}
        </p>

        <div className="mt-3 space-y-1 text-sm">
          {preview.ranks.map((item) => (
            <p key={item.player.id}>
              {item.rank}. {displayName(item.player)}（{item.player.position}）
            </p>
          ))}
        </div>

        <div className="mt-3 rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
          {preview.tributeLines.map((line) => (
            <p key={line}>· {line}</p>
          ))}
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            抗贡在下一局开始后确认（看牌后再勾选）。
          </p>
        </div>

        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
          级数：{ourTeamNames} {levelToLabel(session.ourLevel)} →{' '}
          {levelToLabel(preview.nextOurLevel)}，{opponentTeamNames}{' '}
          {levelToLabel(session.opponentLevel)} → {levelToLabel(preview.nextOpponentLevel)}
        </p>

        {preview.aceMessage && (
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{preview.aceMessage}</p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className="rounded-lg bg-our px-3 py-2 text-sm font-semibold text-white"
            onClick={onConfirm}
          >
            确认进入下局
          </button>
        </div>
      </div>
    </div>
  );
}
