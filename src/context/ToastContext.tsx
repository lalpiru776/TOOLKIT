import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  Download,
  FileCheck,
  RefreshCw,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
  Sparkles,
  ArrowRight,
  FileText,
  FileSpreadsheet,
  Camera,
  Layers,
} from 'lucide-react';
import { useTheme } from './ThemeContext';

export type ToastType = 'download' | 'conversion' | 'success' | 'info' | 'error' | 'warning';

export interface ToastOptions {
  id?: string;
  title?: string;
  message?: string;
  type?: ToastType;
  fileName?: string;
  fileSize?: string;
  fromFormat?: string;
  toFormat?: string;
  toolName?: string;
  duration?: number; // in ms, default 4500
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastItem extends Required<Pick<ToastOptions, 'id' | 'type' | 'duration'>> {
  title?: string;
  message: string;
  fileName?: string;
  fileSize?: string;
  fromFormat?: string;
  toFormat?: string;
  toolName?: string;
  timestamp: Date;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (options: ToastOptions | string) => string;
  showDownloadToast: (
    fileName: string,
    options?: { size?: string | number; format?: string; toolName?: string; message?: string }
  ) => string;
  showConversionToast: (
    fileName: string,
    options?: { fromFormat?: string; toFormat?: string; toolName?: string; message?: string }
  ) => string;
  showSuccessToast: (message: string, title?: string) => string;
  showErrorToast: (message: string, title?: string) => string;
  showInfoToast: (message: string, title?: string) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Subtle Web Audio Chime for audio feedback
function playChime(type: ToastType) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'download' || type === 'conversion' || type === 'success') {
      // Pleasant melodic two-tone chime (C6 -> G6)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6
      osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.08); // G6
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {
    // Ignore audio autoplay restrictions safely
  }
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const themeContext = useTheme();
  const soundEnabled = themeContext ? themeContext.soundEnabled : true;

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const showToast = useCallback(
    (options: ToastOptions | string): string => {
      const id = typeof options === 'object' && options.id ? options.id : `toast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const type: ToastType = typeof options === 'object' && options.type ? options.type : 'success';
      const duration = typeof options === 'object' && options.duration ? options.duration : 4500;

      let message = '';
      let title: string | undefined;
      let fileName: string | undefined;
      let fileSize: string | undefined;
      let fromFormat: string | undefined;
      let toFormat: string | undefined;
      let toolName: string | undefined;
      let action: { label: string; onClick: () => void } | undefined;

      if (typeof options === 'string') {
        message = options;
      } else {
        message = options.message || '';
        title = options.title;
        fileName = options.fileName;
        fileSize = options.fileSize;
        fromFormat = options.fromFormat;
        toFormat = options.toFormat;
        toolName = options.toolName;
        action = options.action;
      }

      if (!message && fileName) {
        if (type === 'download') {
          message = `File ready and saved to your device.`;
        } else if (type === 'conversion') {
          message = `File conversion completed successfully.`;
        }
      }

      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        fileName,
        fileSize,
        fromFormat,
        toFormat,
        toolName,
        timestamp: new Date(),
        duration,
        action,
      };

      setToasts((prev) => {
        // Keep max 4 toasts to maintain clean viewport
        const filtered = prev.filter((t) => t.id !== id);
        return [newToast, ...filtered].slice(0, 4);
      });

      if (soundEnabled) {
        playChime(type);
      }

      return id;
    },
    [soundEnabled]
  );

  const showDownloadToast = useCallback(
    (
      fileName: string,
      options?: { size?: string | number; format?: string; toolName?: string; message?: string }
    ) => {
      const formattedSize =
        typeof options?.size === 'number'
          ? options.size > 1024
            ? `${(options.size / 1024).toFixed(1)} MB`
            : `${options.size} KB`
          : options?.size;

      return showToast({
        type: 'download',
        title: 'Download Confirmed',
        fileName,
        fileSize: formattedSize,
        toFormat: options?.format || fileName.split('.').pop()?.toUpperCase() || 'FILE',
        toolName: options?.toolName,
        message: options?.message || `Successfully downloaded "${fileName}" to your local storage.`,
        duration: 4800,
      });
    },
    [showToast]
  );

  const showConversionToast = useCallback(
    (
      fileName: string,
      options?: { fromFormat?: string; toFormat?: string; toolName?: string; message?: string }
    ) => {
      return showToast({
        type: 'conversion',
        title: 'Conversion Complete',
        fileName,
        fromFormat: options?.fromFormat,
        toFormat: options?.toFormat,
        toolName: options?.toolName,
        message:
          options?.message ||
          (options?.fromFormat && options?.toFormat
            ? `Successfully transformed from ${options.fromFormat} into ${options.toFormat}.`
            : `File "${fileName}" was successfully processed and formatted.`),
        duration: 4800,
      });
    },
    [showToast]
  );

  const showSuccessToast = useCallback(
    (message: string, title = 'Operation Successful') => {
      return showToast({
        type: 'success',
        title,
        message,
        duration: 4200,
      });
    },
    [showToast]
  );

  const showErrorToast = useCallback(
    (message: string, title = 'Action Failed') => {
      return showToast({
        type: 'error',
        title,
        message,
        duration: 6000,
      });
    },
    [showToast]
  );

  const showInfoToast = useCallback(
    (message: string, title = 'Notice') => {
      return showToast({
        type: 'info',
        title,
        message,
        duration: 4000,
      });
    },
    [showToast]
  );

  // Listen to window custom events so helper functions can trigger toasts
  useEffect(() => {
    const handleCustomToast = (event: CustomEvent<ToastOptions>) => {
      if (event.detail) {
        showToast(event.detail);
      }
    };

    window.addEventListener('toolkit-toast' as any, handleCustomToast as any);
    return () => {
      window.removeEventListener('toolkit-toast' as any, handleCustomToast as any);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        showDownloadToast,
        showConversionToast,
        showSuccessToast,
        showErrorToast,
        showInfoToast,
        removeToast,
        clearToasts,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Global helper for non-React contexts
export function emitToast(options: ToastOptions) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('toolkit-toast', { detail: options }));
  }
}

// --------------------------------------------------------------------------
// Individual Toast Item Card with Animated Progress Countdown & Hover Pause
// --------------------------------------------------------------------------
const ToastItemCard: React.FC<{
  toast: ToastItem;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(toast.duration);

  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentRemaining = Math.max(0, remainingTimeRef.current - elapsed);
      const pct = (currentRemaining / toast.duration) * 100;
      setProgress(pct);

      if (currentRemaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 40);

    return () => {
      clearInterval(interval);
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - (Date.now() - startTimeRef.current));
    };
  }, [isPaused, toast.id, toast.duration, onDismiss]);

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Style configs by type
  const getTypeConfig = () => {
    switch (toast.type) {
      case 'download':
        return {
          icon: Download,
          badgeLabel: 'Downloaded',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          accentBg: 'bg-emerald-600',
          iconContainer: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/80',
          progressBar: 'bg-emerald-500',
          ringBorder: 'border-emerald-500/30',
        };
      case 'conversion':
        return {
          icon: FileCheck,
          badgeLabel: 'Converted',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          accentBg: 'bg-blue-600',
          iconContainer: 'bg-blue-500/10 text-blue-600 border-blue-200/80',
          progressBar: 'bg-blue-500',
          ringBorder: 'border-blue-500/30',
        };
      case 'success':
        return {
          icon: CheckCircle2,
          badgeLabel: 'Success',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          accentBg: 'bg-emerald-600',
          iconContainer: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/80',
          progressBar: 'bg-emerald-500',
          ringBorder: 'border-emerald-500/30',
        };
      case 'error':
        return {
          icon: AlertCircle,
          badgeLabel: 'Failed',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          accentBg: 'bg-rose-600',
          iconContainer: 'bg-rose-500/10 text-rose-600 border-rose-200/80',
          progressBar: 'bg-rose-500',
          ringBorder: 'border-rose-500/30',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          badgeLabel: 'Warning',
          badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
          accentBg: 'bg-amber-600',
          iconContainer: 'bg-amber-500/10 text-amber-600 border-amber-200/80',
          progressBar: 'bg-amber-500',
          ringBorder: 'border-amber-500/30',
        };
      case 'info':
      default:
        return {
          icon: Info,
          badgeLabel: 'Info',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
          accentBg: 'bg-slate-700',
          iconContainer: 'bg-slate-500/10 text-slate-700 border-slate-200/80',
          progressBar: 'bg-slate-600',
          ringBorder: 'border-slate-300',
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group pointer-events-auto relative w-full max-w-sm sm:max-w-md overflow-hidden rounded-2xl border border-white/90 bg-white/95 p-4 shadow-xl shadow-slate-900/10 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl animate-in fade-in slide-in-from-bottom-5"
    >
      {/* Top Header Row */}
      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${config.iconContainer} shadow-xs`}
        >
          <IconComponent className="h-5 w-5" />
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-slate-900">
              {toast.title || (toast.type === 'download' ? 'Download Confirmed' : toast.type === 'conversion' ? 'Conversion Successful' : 'Confirmed')}
            </h4>

            {/* Badge */}
            <span
              className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${config.badgeClass}`}
            >
              {config.badgeLabel}
            </span>

            {toast.toolName && (
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600">
                {toast.toolName}
              </span>
            )}
          </div>

          {/* Primary File Name Highlight */}
          {toast.fileName && (
            <div className="mt-1 flex items-center gap-1.5 text-xs font-mono font-bold text-slate-800 truncate bg-slate-50/80 px-2 py-1 rounded-lg border border-slate-200/60">
              <span className="truncate">{toast.fileName}</span>
              {toast.fileSize && (
                <span className="text-[10px] text-slate-500 font-sans font-normal shrink-0">
                  ({toast.fileSize})
                </span>
              )}
            </div>
          )}

          {/* Format Transformation Pills (e.g. DOCX -> PDF) */}
          {(toast.fromFormat || toast.toFormat) && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-bold">
              {toast.fromFormat && (
                <span className="rounded bg-slate-100 text-slate-700 px-1.5 py-0.5 border border-slate-200">
                  {toast.fromFormat}
                </span>
              )}
              {toast.fromFormat && toast.toFormat && (
                <ArrowRight className="h-3 w-3 text-slate-400 shrink-0" />
              )}
              {toast.toFormat && (
                <span className="rounded bg-blue-50 text-blue-700 px-1.5 py-0.5 border border-blue-200">
                  {toast.toFormat}
                </span>
              )}
            </div>
          )}

          {/* Descriptive Message */}
          <p className="mt-1 text-xs text-slate-600 leading-relaxed break-words">
            {toast.message}
          </p>

          {/* Optional Action Button */}
          {toast.action && (
            <div className="mt-2.5">
              <button
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                {toast.action.label}
              </button>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onDismiss(toast.id)}
          aria-label="Dismiss notification"
          className="absolute top-3.5 right-3.5 flex h-6 w-6 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Countdown Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100">
        <div
          className={`h-full transition-all duration-75 ease-linear ${config.progressBar}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// --------------------------------------------------------------------------
// Toast Container (Fixed in bottom-right viewport with responsive handling)
// --------------------------------------------------------------------------
const ToastContainer: React.FC<{
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col-reverse gap-3 max-w-[calc(100vw-2rem)]"
    >
      {toasts.map((toast) => (
        <ToastItemCard key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
