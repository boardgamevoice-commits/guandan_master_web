export function HistoryPage() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">历史记录</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          按时间倒序展示局数、名次与级数变动。Phase 2 接入 localStorage。
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
        暂无历史记录
      </div>
    </section>
  );
}
