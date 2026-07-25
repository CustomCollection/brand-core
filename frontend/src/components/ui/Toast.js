'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TOAST_DURATION } from '@/lib/constants';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: 'bg-success-light border-success text-success',
  error: 'bg-error-light border-error text-error',
  warning: 'bg-warning-light border-warning text-warning',
  info: 'bg-info-light border-info text-info',
};

function ToastItem({ id, type = 'info', message, onClose }) {
  const Icon = ICONS[type] || Info;
  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 border rounded-none shadow-lg min-w-72 max-w-sm animate-slide-in-right',
        STYLES[type]
      )}
      role='alert'
    >
      <Icon size={18} className='flex-shrink-0 mt-0.5' />
      <p className='flex-1 text-sm font-medium leading-relaxed'>{message}</p>
      <button
        onClick={() => onClose(id)}
        className='flex-shrink-0 hover:opacity-70 transition-opacity'
        aria-label='Dismiss'
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message, type = 'info', duration = TOAST_DURATION) => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  const toast = {
    success: (msg, dur) => show(msg, 'success', dur),
    error: (msg, dur) => show(msg, 'error', dur),
    warning: (msg, dur) => show(msg, 'warning', dur),
    info: (msg, dur) => show(msg, 'info', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className='fixed top-4 right-4 z-[200] flex flex-col gap-2'>
            {toasts.map((t) => (
              <ToastItem key={t.id} {...t} onClose={dismiss} />
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
