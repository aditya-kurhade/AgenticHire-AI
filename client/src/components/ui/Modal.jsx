import * as React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

export function Modal({ isOpen, open, onClose, title, children, maxWidth = 'max-w-lg', className }) {
  const isVisible = isOpen ?? open ?? false;

  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        onClose?.();
      }
    };
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden transition-all duration-300 ease-in-out"
      style={{
        paddingLeft: 'max(1rem, var(--sidebar-current-width, 4.5rem))'
      }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-50 w-full max-h-[88vh] flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 text-card-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200',
          maxWidth,
          className
        )}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-border shrink-0">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3.5 flex-1 min-h-0 overflow-hidden flex flex-col">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
