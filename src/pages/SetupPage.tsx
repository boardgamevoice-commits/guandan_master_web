import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ANTI_TRIBUTE_PRESETS } from '@/domain/houseRules';
import { useGameStore, getDefaultSetupInput } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';
import type { Position, Team } from '@/types/game';

const POSITIONS: Position[] = ['东', '南', '西', '北'];

export function SetupPage() {
  const navigate = useNavigate();
  const session = useGameStore((state) => state.session);
  const createSession = useGameStore((state) => state.createSession);
  const showResetDialog = useUiStore((state) => state.setupResetDialogOpen);
  const openResetDialog = useUiStore((state) => state.openSetupResetDialog);
  const closeResetDialog = useUiStore((state) => state.closeSetupResetDialog);
  const showToast = useUiStore((state) => state.showToast);
  const defaults = useMemo(() => getDefaultSetupInput(), []);

  const [names, setNames] = useState(defaults.names);
  const [ourLevel, setOurLevel] = useState(defaults.ourLevel);
  const [opponentLevel, setOpponentLevel] = useState(defaults.opponentLevel);
  const [dealerTeam, setDealerTeam] = useState<Team>(defaults.dealerTeam);
  const [antiPreset, setAntiPreset] = useState(defaults.antiTributePreset);
  const [aceRequiresDoubleDown, setAceRequiresDoubleDown] = useState(
    defaults.aceRequiresDoubleDown,
  );

  useEffect(() => {
    if (!session) return;
    const nextNames = { ...defaults.names };
    session.players.forEach((player) => {
      nextNames[player.position] = player.name;
    });
    setNames(nextNames);
    setOurLevel(session.ourLevel);
    setOpponentLevel(session.opponentLevel);
    setDealerTeam(session.currentDealer);
    setAntiPreset(session.houseRules.antiTributePreset);
    setAceRequiresDoubleDown(session.houseRules.aceRequiresDoubleDown);
  }, [defaults.names, session]);

  const levels = Array.from({ length: 13 }, (_, idx) => idx + 2);

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">开局设置</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          绑定座位、设定级数与房规。无需登录，数据仅保存在本机浏览器。
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          createSession({
            names,
            ourLevel,
            opponentLevel,
            dealerTeam,
            antiTributePreset: antiPreset,
            aceRequiresDoubleDown,
          });
          navigate('/game');
        }}
      >
        <div className="space-y-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
          <p className="text-sm font-medium">玩家信息</p>
          {POSITIONS.map((position) => {
            const isOurTeam = position === '南' || position === '北';
            return (
              <label key={position} className="flex items-center gap-3 text-sm">
                <span
                  className={[
                    'w-8 shrink-0 rounded px-2 py-1 text-center text-xs',
                    isOurTeam
                      ? 'bg-our/10 text-our'
                      : 'bg-opponent/10 text-opponent',
                  ].join(' ')}
                >
                  {position}
                </span>
                <input
                  type="text"
                  value={names[position]}
                  onChange={(event) =>
                    setNames((current) => ({
                      ...current,
                      [position]: event.target.value,
                    }))
                  }
                  placeholder={`${position}位玩家（可留空）`}
                  className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
              </label>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
          <label className="space-y-1 text-sm">
            <span className="text-neutral-500">南北级数</span>
            <select
              value={ourLevel}
              onChange={(event) => setOurLevel(Number(event.target.value))}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-neutral-500">东西级数</span>
            <select
              value={opponentLevel}
              onChange={(event) => setOpponentLevel(Number(event.target.value))}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="space-y-3 rounded-2xl border border-neutral-200 p-4 text-sm dark:border-neutral-800">
          <p className="font-medium">首局先出牌</p>
          <div className="flex gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="dealerTeam"
                checked={dealerTeam === 'our'}
                onChange={() => setDealerTeam('our')}
              />
              南北
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="dealerTeam"
                checked={dealerTeam === 'opponent'}
                onChange={() => setDealerTeam('opponent')}
              />
              东西
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-neutral-500">抗贡房规</span>
            <select
              value={antiPreset}
              onChange={(event) => setAntiPreset(event.target.value as typeof antiPreset)}
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
            >
              {ANTI_TRIBUTE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={aceRequiresDoubleDown}
              onChange={(event) => setAceRequiresDoubleDown(event.target.checked)}
            />
            打 A 必须双下
          </label>
        </div>

        <div className="space-y-2">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-xl bg-our px-4 py-3 text-sm font-semibold text-white"
          >
            进入记分主控台
          </button>
          {session && (
            <button
              type="button"
              className="w-full rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600"
              onClick={openResetDialog}
            >
              新对局（重置）
            </button>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={showResetDialog}
        title="确认开始新对局？"
        message="当前对局历史将被清空。"
        confirmLabel="确认重置"
        onCancel={closeResetDialog}
        onConfirm={() => {
          createSession({
            names: defaults.names,
            ourLevel: 2,
            opponentLevel: 2,
            dealerTeam: 'our',
            antiTributePreset: defaults.antiTributePreset,
            aceRequiresDoubleDown: true,
          });
          closeResetDialog();
          showToast('已开始新对局');
          navigate('/game');
        }}
      />
    </section>
  );
}
