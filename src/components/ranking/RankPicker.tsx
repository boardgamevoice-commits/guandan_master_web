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
  return (
    <div className="space-y-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
      <p className="text-sm font-medium">录入名次</p>
      <p className="text-xs text-neutral-500">为第 1–4 名各选一名玩家，不可重复。</p>
      {RANK_LABELS.map((label, index) => (
        <div key={label} className="flex items-center gap-3">
          <span className="w-14 shrink-0 text-sm text-neutral-500">{label}</span>
          <select
            className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            value={ranks[index] ?? ''}
            onChange={(event) => onSetRank(index, event.target.value)}
          >
            <option value="">选择玩家</option>
            {players.map((player) => {
              const occupiedByOthers = ranks.some(
                (rank, rankIndex) => rank === player.id && rankIndex !== index,
              );
              if (occupiedByOthers) return null;
              return (
                <option key={player.id} value={player.id}>
                  {displayName(player)}（{player.position}）
                </option>
              );
            })}
          </select>
        </div>
      ))}
      <button
        type="button"
        className="text-sm text-neutral-500 underline"
        onClick={onReset}
      >
        撤销重选
      </button>
    </div>
  );
}
