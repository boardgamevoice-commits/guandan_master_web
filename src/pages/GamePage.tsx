export function GamePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-dealer/30 bg-dealer/10 px-4 py-3 text-center text-sm font-medium text-amber-900 dark:text-amber-100">
        👑 当前轮次：南北队打 2
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-our bg-our/10 p-4 shadow-sm">
          <p className="text-xs text-neutral-500">我方 · 南北 · 先出牌</p>
          <p className="mt-1 text-3xl font-bold text-our">2</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-4 opacity-70 dark:border-neutral-800">
          <p className="text-xs text-neutral-500">对方 · 东西</p>
          <p className="mt-1 text-3xl font-bold text-opponent">2</p>
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800">
        <p className="text-sm font-medium">录入名次</p>
        <p className="text-xs text-neutral-500">
          为第 1–4 名各选一名玩家（Phase 1 名单选择器，四方阵动画 Phase 2）
        </p>
        {['第 1 名', '第 2 名', '第 3 名', '第 4 名'].map((label) => (
          <div key={label} className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-sm text-neutral-500">{label}</span>
            <select
              className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              disabled
              defaultValue=""
            >
              <option value="">选择玩家</option>
            </select>
          </div>
        ))}
        <button
          type="button"
          className="text-sm text-neutral-500 underline"
          disabled
        >
          撤销重选
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-900/50">
        <p className="font-medium">进贡指引（文字）</p>
        <p className="mt-1 text-neutral-500">录入完成后在此显示进贡关系文案</p>
      </div>

      <button
        type="button"
        className="w-full rounded-xl bg-our py-3 text-sm font-semibold text-white opacity-50"
        disabled
      >
        确认并进入下局
      </button>
    </section>
  );
}
