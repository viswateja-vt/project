import {
  X,
} from 'lucide-react';
import {
  useEffect,
  type ReactNode,
} from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const sizeClass =
    size === 'sm'
      ? 'max-w-md'
      : size === 'lg'
        ? 'max-w-2xl'
        : size === 'xl'
          ? 'max-w-4xl'
          : 'max-w-lg';

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={
        title
          ? 'modal-title'
          : undefined
      }
      aria-describedby={
        description
          ? 'modal-description'
          : undefined
      }
    >
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        onClick={
          closeOnBackdrop
            ? onClose
            : undefined
        }
        aria-hidden="true"
      />

      <div
        className={[
          'relative my-auto w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-800 dark:bg-slate-900',
          sizeClass,
          className,
        ].join(' ')}
      >
        {(title ||
          description ||
          showCloseButton) && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
            <div className="min-w-0">
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-bold tracking-tight text-slate-950 dark:text-white"
                >
                  {title}
                </h2>
              )}

              {description && (
                <p
                  id="modal-description"
                  className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400"
                >
                  {description}
                </p>
              )}
            </div>

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}