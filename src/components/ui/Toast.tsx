import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  subtext?: string;
}

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-teal-500',
          bg: 'bg-white',
          icon: <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />,
        };
      case 'warning':
        return {
          border: 'border-amber-500',
          bg: 'bg-white',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
        };
      case 'error':
        return {
          border: 'border-red-600',
          bg: 'bg-white',
          icon: <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />,
        };
      default:
        return {
          border: 'border-navy-700',
          bg: 'bg-white',
          icon: <Info className="w-4 h-4 text-navy-700 shrink-0" />,
        };
    }
  };

  const style = getStyles();

  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-lg border shadow-lg ${style.border} ${style.bg} text-xs text-navy-900 min-w-[280px] max-w-sm animate-in slide-in-from-bottom-3 duration-200`}
    >
      <div className="mt-0.5">{style.icon}</div>
      <div className="flex-1">
        <div className="font-semibold text-navy-900">{toast.message}</div>
        {toast.subtext && <div className="text-slate-500 mt-0.5 text-[11px]">{toast.subtext}</div>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-navy-900 p-0.5 rounded transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-auto">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export default Toast;
