import type { Player, Position } from '@/types/game';
import { countFilledRanks } from '@/domain/rankingDraft';
import { displayName } from '@/utils/format';

const RANK_LABELS = ['第 1 名', '第 2 名', '第 3 名', '第 4 名'];
const RANK_TITLES = ['1-头游', '2-二游', '3-三游', '4-末游'];
const POSITION_ORDER: Position[] = ['东', '南', '西', '北'];

interface RankPickerProps {
  players: Player[];
  ranks: Array<string | null>;
  onTogglePlayer: (playerId: string) => void;
  onUndoLast: () => void;
  onReset: () => void;
  disabled?: boolean;
}

export function RankPicker({
  players,
  ranks,
  onTogglePlayer,
  onUndoLast,
  onReset,
  disabled = false,
}: RankPickerProps) {
  const selectedCount = countFilledRanks(ranks);
  const isComplete = selectedCount === 4;

  const sortedPlayers = [...players].sort(
    (left, right) =>
      POSITION_ORDER.indexOf(left.position) - POSITION_ORDER.indexOf(right.position),
  );

  return (
    <div className="space-y-2 rounded-2xl border border-neutral-200 p-3 dark:border-neutral-800">
      <p className="text-sm font-medium">录入名次</p>

      <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
        {disabled
          ? '请先确认上一局进贡/抗贡，再录入本局名次'
          : isComplete
          ? '名次已录入完成，可确认进贡信息'
          : `已录入 ${selectedCount}/4，下一位：${RANK_LABELS[selectedCount]}`}
      </div>

      <div className="grid grid-cols-4 gap-2">
        {sortedPlayers.map((player) => {
          const isSelected = ranks.includes(player.id);
          const teamBorder =
            player.team === 'our' ? 'border-l-4 border-l-our' : 'border-l-4 border-l-opponent';

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => onTogglePlayer(player.id)}
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={`${displayName(player)}，${player.position}，${
                isSelected ? '已选中' : '未排名'
              }`}
              className={[
                'min-h-11 rounded-lg border px-2 py-2 text-center text-xs transition disabled:cursor-not-allowed disabled:opacity-50',
                teamBorder,
                isSelected
                  ? 'border-our bg-our/10 text-neutral-900 dark:text-neutral-100'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900',
              ].join(' ')}
            >
              <p className="truncate font-medium">{displayName(player)}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
        {sortedPlayers.map((player) => {
          const rankIndex = ranks.findIndex((id) => id === player.id);
          const selected = rankIndex >= 0;
          return (
            <div
              key={player.id}
              className={[
                'rounded-md px-2 py-1',
                selected
                  ? 'bg-our/10 font-medium text-our'
                  : 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800',
              ].join(' ')}
            >
              {selected ? RANK_TITLES[rankIndex] : '--'}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-xs">
        <button
          type="button"
          className="text-neutral-500 underline disabled:opacity-40"
          onClick={onUndoLast}
          disabled={disabled || selectedCount === 0}
        >
          撤销上一步
        </button>
        <button
          type="button"
          className="text-neutral-500 underline disabled:opacity-40"
          onClick={onReset}
          disabled={disabled || selectedCount === 0}
        >
          清空重选
        </button>
      </div>
    </div>
  );
}
