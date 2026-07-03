import { levelToLabel, type GameRoundRecord, type Player } from '@/types/game';
import { displayName, resultTypeLabel } from '@/utils/format';

interface RoundDetailModalProps {
  round: GameRoundRecord;
  players: Player[];
  onCopy: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function RoundDetailModal({
  round,
  players,
  onCopy,
  onDelete,
  onClose,
}: RoundDetailModalProps) {
  const playerMap = new Map(players.map((player) => [player.id, player]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-neutral-900">
        <h3 className="text-base font-semibold">第 {round.roundNumber} 局详情</h3>
        <p className="mt-2 text-sm text-neutral-500">结果：{resultTypeLabel(round.resultType)}</p>
        <p className="mt-2 text-sm text-neutral-500">
          南北 {levelToLabel(round.ourLevelSnapshot)} / 东西{' '}
          {levelToLabel(round.opponentLevelSnapshot)}
        </p>
        <p className="mt-1 text-sm text-neutral-500">
          逢人配：红心 {levelToLabel(round.currentWildCard)} ·
          {' '}
          {round.isAntiTribute ? '抗贡' : '进贡'}
        </p>

        <div className="mt-3 space-y-1 text-sm">
          {round.ranks.map((playerId, index) => {
            const player = playerMap.get(playerId);
            if (!player) return null;
            return (
              <p key={`${round.id}-${player.id}`}>
                {index + 1}. {displayName(player)}（{player.position}）
              </p>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            type="button"
            className="rounded-lg bg-our px-3 py-2 text-sm font-semibold text-white"
            onClick={onCopy}
          >
            复制本局
          </button>
          <button
            type="button"
            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
            onClick={onDelete}
          >
            删除本局
          </button>
          <button
            type="button"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700"
            onClick={onClose}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
}
