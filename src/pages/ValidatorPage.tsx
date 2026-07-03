export function ValidatorPage() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">牌型校验</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          同步当前红心级牌，验证出牌是否合法。与 iOS 同步首发，Phase 1 实现。
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700">
        扑克牌快捷键盘 · 逢人配校验（开发中）
      </div>
    </section>
  );
}
