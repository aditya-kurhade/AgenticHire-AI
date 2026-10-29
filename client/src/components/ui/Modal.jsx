import { useEffect } from 'react';
import { cn } from '../../lib/utils';

export function Modal({ open, onClose, title, children, className, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-inverse-surface/45 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'bg-white rounded-3xl border border-[#e8ded5] p-6 w-full shadow-2xl relative text-left animate-in fade-in zoom-in-95 duration-200',
          sizes[size],
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-[#F8F5EF] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
        {title && (
          <h3 id="modal-title" className="text-lg font-bold text-on-surface mb-4 pr-8">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
}
