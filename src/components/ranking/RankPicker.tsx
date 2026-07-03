import type { Player, Position } from '@/types/game';
import { countFilledRanks } from '@/domain/rankingDraft';
import { displayName } from '@/utils/format';

const RANK_LABELS = ['第 1 名', '第 2 名', '第 3 名', '第 4 名'];
const POSITION_ORDER: Position[] = ['东', '南', '西', '北'];

interface RankPickerProps {
  players: Player[];
  ranks: Array<string | null>;
  onTogglePlayer: (playerId: string) => void;
  onUndoLast: () => void;
  onReset: () => void;
}

export function RankPicker({
  players,
  ranks,
  onTogglePlayer,
  onUndoLast,
  onReset,
}: RankPickerProps) {
  const selectedCount = countFilledRanks(ranks);
  const isComplete = selectedCount === 4;

  const sortedPlayers = [...players].sort(
    (left, right) =>
      POSITION_ORDER.indexOf(left.position) - POSITION_ORDER.indexOf(right.position),
  );

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
      <p className="text-sm font-medium">录入名次</p>
      <p className="text-xs text-neutral-500">
        请按出完顺序点击玩家，下方会显示名次。点错可再次点击取消。
      </p>

      <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
        {isComplete
          ? '名次已录入完成，可确认进贡信息'
          : `已录入 ${selectedCount}/4，下一位：${RANK_LABELS[selectedCount]}`}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {sortedPlayers.map((player) => {
          const isSelected = ranks.includes(player.id);
          const teamBorder =
            player.team === 'our' ? 'border-l-4 border-l-our' : 'border-l-4 border-l-opponent';

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => onTogglePlayer(player.id)}
              aria-pressed={isSelected}
              aria-label={`${displayName(player)}，${player.position}，${
                isSelected ? '已选中' : '未排名'
              }`}
              className={[
                'min-h-11 rounded-xl border px-3 py-3 text-left text-sm transition',
                teamBorder,
                isSelected
                  ? 'border-our bg-our/10 text-neutral-900 dark:text-neutral-100'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900',
              ].join(' ')}
            >
              <p className="font-medium">{displayName(player)}</p>
              <p className="mt-1 text-xs text-neutral-500">{player.position}</p>
            </button>
          );
        })}
      </div>

      <div
        className={[
          'space-y-2 rounded-lg border p-3',
          isComplete
            ? 'border-our/40 bg-our/5 dark:border-our/30'
            : 'border-dashed border-neutral-200 dark:border-neutral-700',
        ].join(' ')}
      >
        {RANK_LABELS.map((label, index) => {
          const player = players.find((item) => item.id === ranks[index]);
          return (
            <p key={label} className="text-sm text-neutral-600 dark:text-neutral-300">
              {label}：{player ? `${displayName(player)}（${player.position}）` : '待选择'}
            </p>
          );
        })}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <button
          type="button"
          className="text-neutral-500 underline disabled:opacity-40"
          onClick={onUndoLast}
          disabled={selectedCount === 0}
        >
          撤销上一步
        </button>
        <button
          type="button"
          className="text-neutral-500 underline disabled:opacity-40"
          onClick={onReset}
          disabled={selectedCount === 0}
        >
          清空重选
        </button>
      </div>
    </div>
  );
}
