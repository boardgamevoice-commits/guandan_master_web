import type { Player } from '@/types/game';
import { displayName } from '@/utils/format';

const RANK_LABELS = ['第 1 名', '第 2 名', '第 3 名', '第 4 名'];

interface RankPickerProps {
  players: Player[];
  ranks: Array<string | null>;
  onSetRank: (index: number, playerId: string) => void;
  onReset: () => void;
}

export function RankPicker({ players, ranks, onSetRank, onReset }: RankPickerProps) {
  const nextRankIndex = ranks.findIndex((rank) => rank === null);
  const selectedCount = ranks.filter((rank) => rank !== null).length;

  function handlePick(playerId: string) {
    const existingRankIndex = ranks.findIndex((rank) => rank === playerId);
    if (existingRankIndex >= 0) {
      onSetRank(existingRankIndex, '');
      return;
    }
    if (nextRankIndex >= 0) {
      onSetRank(nextRankIndex, playerId);
    }
  }

  function handleUndoLastStep() {
    const lastFilledIndex = ranks.reduce(
      (latest, rank, index) => (rank ? index : latest),
      -1,
    );
    if (lastFilledIndex >= 0) {
      onSetRank(lastFilledIndex, '');
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
      <p className="text-sm font-medium">录入名次</p>
      <p className="text-xs text-neutral-500">
        请按出完顺序点击玩家：先出完的是第 1 名。再次点击已选玩家可取消该名次。
      </p>

      <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
        {selectedCount < 4
          ? `已录入 ${selectedCount}/4，下一位：${RANK_LABELS[selectedCount]}`
          : '名次已录入完成，可确认进贡信息'}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {players.map((player) => {
          const rankIndex = ranks.findIndex((rank) => rank === player.id);
          const isSelected = rankIndex >= 0;
          return (
            <button
              key={player.id}
              type="button"
              onClick={() => handlePick(player.id)}
              className={[
                'relative rounded-xl border px-3 py-3 text-left text-sm transition',
                isSelected
                  ? 'border-our bg-our/10 text-neutral-900 dark:text-neutral-100'
                  : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900',
              ].join(' ')}
            >
              <p className="font-medium">{displayName(player)}</p>
              <p className="mt-1 text-xs text-neutral-500">{player.position}</p>
              {isSelected && (
                <span className="absolute right-2 top-2 rounded bg-our px-2 py-0.5 text-[11px] font-semibold text-white">
                  {rankIndex + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="space-y-2 rounded-lg border border-dashed border-neutral-200 p-3 dark:border-neutral-700">
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
          className="text-neutral-500 underline"
          onClick={handleUndoLastStep}
          disabled={selectedCount === 0}
        >
          撤销上一步
        </button>
        <button
          type="button"
          className="text-neutral-500 underline"
          onClick={onReset}
          disabled={selectedCount === 0}
        >
          清空重选
        </button>
      </div>
    </div>
  );
}
