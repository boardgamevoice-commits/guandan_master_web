import { Link } from 'react-router-dom';

export function GamePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-dealer/30 bg-dealer/10 px-4 py-3 text-center text-sm font-medium text-amber-900 dark:text-amber-100">
        👑 当前轮次：南北队打 2
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-our bg-our/10 p-4 shadow-sm">
          <p className="text-xs text-neutral-500">我方 · 南北</p>
          <p className="mt-1 text-3xl font-bold text-our">2</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 p-4 opacity-70 dark:border-neutral-800">
          <p className="text-xs text-neutral-500">对方 · 东西</p>
          <p className="mt-1 text-3xl font-bold text-opponent">2</p>
        </div>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-sm rounded-3xl border border-neutral-200 bg-white/60 p-6 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60">
        <p className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400">
          四方阵交互区（开发中）
        </p>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full border-2 border-neutral-300 px-4 py-2 text-sm">
          北
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border-2 border-neutral-300 px-4 py-2 text-sm">
          南
        </div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full border-2 border-neutral-300 px-4 py-2 text-sm">
          西
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border-2 border-neutral-300 px-4 py-2 text-sm">
          东
        </div>
      </div>

      <p className="text-center text-xs text-neutral-500">
        按出牌顺序点击头像录入 1–4 名，完成后展示进贡箭头。
      </p>

      <Link
        to="/setup"
        className="block text-center text-sm text-neutral-500 underline"
      >
        修改开局设置
      </Link>
    </section>
  );
}
