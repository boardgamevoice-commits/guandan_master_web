import { useMemo, useState } from 'react';
import { validateHand, type CardInput, type CardRank, type CardSuit } from '@/domain/cardValidator';
import { levelToLabel } from '@/types/game';
import { useGameStore } from '@/stores/gameStore';

const RANK_OPTIONS: CardRank[] = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 'SJ', 'BJ',
];

const SUIT_OPTIONS: Array<{ value: CardSuit; label: string }> = [
  { value: 'spade', label: '♠' },
  { value: 'heart', label: '♥' },
  { value: 'club', label: '♣' },
  { value: 'diamond', label: '♦' },
  { value: 'joker', label: '王' },
];

function cardLabel(card: CardInput): string {
  if (card.rank === 'SJ') return '小王';
  if (card.rank === 'BJ') return '大王';
  const rankLabel =
    typeof card.rank === 'number'
      ? card.rank <= 10
        ? String(card.rank)
        : ['J', 'Q', 'K', 'A'][card.rank - 11]!
      : card.rank;
  const suitLabel =
    card.suit === 'spade'
      ? '♠'
      : card.suit === 'heart'
        ? '♥'
        : card.suit === 'club'
          ? '♣'
          : card.suit === 'diamond'
            ? '♦'
            : '';
  return `${suitLabel}${rankLabel}`;
}

function rankLabel(rank: CardRank): string {
  if (rank === 'SJ') return '小王';
  if (rank === 'BJ') return '大王';
  if (rank <= 10) return String(rank);
  return ['J', 'Q', 'K', 'A'][rank - 11]!;
}

export function ValidatorPage() {
  const session = useGameStore((state) => state.session);
  const wildCardLevel = session
    ? session.playingTeam === 'our'
      ? session.ourLevel
      : session.opponentLevel
    : 2;

  const [suit, setSuit] = useState<CardSuit>('spade');
  const [rank, setRank] = useState<CardRank>(8);
  const [cards, setCards] = useState<CardInput[]>([]);

  const result = useMemo(() => validateHand(cards, wildCardLevel), [cards, wildCardLevel]);

  const addCard = () => {
    const nextSuit =
      rank === 'SJ' || rank === 'BJ' ? 'joker' : suit === 'joker' ? 'spade' : suit;
    setCards((current) => [...current, { suit: nextSuit, rank }]);
  };

  const undoCard = () => {
    setCards((current) => current.slice(0, -1));
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">牌型校验</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          当前逢人配：红心 {levelToLabel(wildCardLevel)}
        </p>
      </div>

      {!session && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200">
          尚未开局，级牌暂按 2 级显示。建议先到「设置」完成开局。
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
        <div className="space-y-3 text-left">
          <p className="text-center text-neutral-500">快速选牌（首版）</p>

          <div className="space-y-2">
            <p className="text-xs text-neutral-500">快捷输入键盘（横向滚动）</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {RANK_OPTIONS.map((item) => (
                <button
                  key={`rank-${String(item)}`}
                  type="button"
                  className={[
                    'shrink-0 rounded-full border px-3 py-1 text-xs',
                    rank === item
                      ? 'border-our bg-our/10 text-our'
                      : 'border-neutral-200 dark:border-neutral-700',
                  ].join(' ')}
                  onClick={() => setRank(item)}
                >
                  {rankLabel(item)}
                </button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {SUIT_OPTIONS.map((option) => (
                <button
                  key={`suit-${option.value}`}
                  type="button"
                  className={[
                    'shrink-0 rounded-full border px-3 py-1 text-xs',
                    suit === option.value
                      ? 'border-our bg-our/10 text-our'
                      : 'border-neutral-200 dark:border-neutral-700',
                  ].join(' ')}
                  onClick={() => setSuit(option.value)}
                  disabled={rank === 'SJ' || rank === 'BJ'}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs">
              花色
              <select
                value={suit}
                onChange={(event) => setSuit(event.target.value as CardSuit)}
                className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              >
                {SUIT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs">
              点数
              <select
                value={String(rank)}
                onChange={(event) => {
                  const value = event.target.value;
                  setRank(value === 'SJ' || value === 'BJ' ? value : Number(value));
                }}
                className="w-full rounded-lg border border-neutral-200 bg-white px-2 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              >
                {RANK_OPTIONS.map((item) => (
                  <option key={String(item)} value={String(item)}>
                    {String(item)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="rounded-lg bg-our px-3 py-2 text-sm font-medium text-white"
              onClick={addCard}
            >
              添加
            </button>
            <button
              type="button"
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700"
              onClick={() => setCards([])}
            >
              清空
            </button>
          </div>

          <button
            type="button"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700"
            onClick={undoCard}
            disabled={cards.length === 0}
          >
            撤销上一张
          </button>

          <div className="flex flex-wrap gap-2 rounded-lg border border-neutral-200 p-2 dark:border-neutral-700">
            {cards.length === 0 ? (
              <span className="text-xs text-neutral-500">尚未选牌</span>
            ) : (
              cards.map((card, index) => (
                <button
                  key={`${card.suit}-${card.rank}-${index}`}
                  type="button"
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs dark:bg-neutral-800"
                  onClick={() =>
                    setCards((current) => current.filter((_, cardIndex) => cardIndex !== index))
                  }
                  title="点击删除"
                >
                  {cardLabel(card)}
                </button>
              ))
            )}
          </div>

          <div
            className={[
              'rounded-lg border px-3 py-2 text-sm',
              result.valid
                ? 'border-our/40 bg-our/10 text-our'
                : 'border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300',
            ].join(' ')}
          >
            {result.valid
              ? `合法：${result.displayName ?? result.handType}`
              : result.error ?? '非法牌型'}
          </div>
        </div>
      </div>
    </section>
  );
}
