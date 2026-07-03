import { Link } from 'react-router-dom';

export function SetupPage() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">开局设置</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          绑定座位、设定级数与房规。完整表单将在 Phase 1 实现。
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
        东南西北 · 初始 2 级 · 房规折叠面板
      </div>

      <Link
        to="/game"
        className="inline-flex w-full items-center justify-center rounded-xl bg-our px-4 py-3 text-sm font-semibold text-white"
      >
        进入记分主控台
      </Link>
    </section>
  );
}
