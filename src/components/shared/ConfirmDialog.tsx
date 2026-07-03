interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl dark:bg-neutral-900">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{message}</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm dark:border-neutral-700"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-lg bg-our px-3 py-2 text-sm font-semibold text-white"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
