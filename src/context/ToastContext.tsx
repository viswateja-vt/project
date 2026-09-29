import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];

  showToast: (
    message: string,
    type?: ToastType,
    options?: {
      title?: string;
      duration?: number;
    }
  ) => string;

  success: (
    message: string,
    title?: string
  ) => string;

  error: (
    message: string,
    title?: string
  ) => string;

  warning: (
    message: string,
    title?: string
  ) => string;

  info: (
    message: string,
    title?: string
  ) => string;

  removeToast: (id: string) => void;

  clearToasts: () => void;
}

const ToastContext =
  createContext<ToastContextValue | undefined>(
    undefined
  );

export function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [toasts, setToasts] =
    useState<Toast[]>([]);

  const removeToast = useCallback(
    (id: string) => {
      setToasts((current) =>
        current.filter(
          (toast) => toast.id !== id
        )
      );
    },
    []
  );

  const showToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      options?: {
        title?: string;
        duration?: number;
      }
    ) => {
      const id = crypto.randomUUID();

      const duration =
        options?.duration ?? 4000;

      const toast: Toast = {
        id,
        type,
        message,
        title: options?.title,
        duration,
      };

      setToasts((current) => [
        ...current,
        toast,
      ]);

      if (duration > 0) {
        window.setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (
      message: string,
      title = 'Success'
    ) =>
      showToast(message, 'success', {
        title,
      }),
    [showToast]
  );

  const error = useCallback(
    (
      message: string,
      title = 'Something went wrong'
    ) =>
      showToast(message, 'error', {
        title,
        duration: 6000,
      }),
    [showToast]
  );

  const warning = useCallback(
    (
      message: string,
      title = 'Warning'
    ) =>
      showToast(message, 'warning', {
        title,
      }),
    [showToast]
  );

  const info = useCallback(
    (
      message: string,
      title = 'Information'
    ) =>
      showToast(message, 'info', {
        title,
      }),
    [showToast]
  );

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value =
    useMemo<ToastContextValue>(
      () => ({
        toasts,
        showToast,
        success,
        error,
        warning,
        info,
        removeToast,
        clearToasts,
      }),
      [
        toasts,
        showToast,
        success,
        error,
        warning,
        info,
        removeToast,
        clearToasts,
      ]
    );

  return (
    <ToastContext.Provider
      value={value}
    >
      {children}

      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
      />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const icon =
    toast.type === 'success'
      ? '✓'
      : toast.type === 'error'
        ? '!'
        : toast.type === 'warning'
          ? '!'
          : 'i';

  const iconClass =
    toast.type === 'success'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
      : toast.type === 'error'
        ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
        : toast.type === 'warning'
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';

  return (
    <div
      role={
        toast.type === 'error'
          ? 'alert'
          : 'status'
      }
      className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/10 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30"
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${iconClass}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        {toast.title && (
          <p className="font-semibold text-slate-950 dark:text-white">
            {toast.title}
          </p>
        )}

        <p className="mt-0.5 text-sm leading-5 text-slate-600 dark:text-slate-400">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const context =
    useContext(ToastContext);

  if (!context) {
    throw new Error(
      'useToast must be used within ToastProvider'
    );
  }

  return context;
}