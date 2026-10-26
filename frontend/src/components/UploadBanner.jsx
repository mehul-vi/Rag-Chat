
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export default function UploadBanner({
  status,
  fileName,
  stage,
  progress,
  error,
  onRetry,
}) {
  if (status === 'idle') return null;

  const isDark =
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark');

  const safeProgress = Math.max(
    0,
    Math.min(100, Number(progress) || 0)
  );

  if (status === 'uploading') {
    return (
      <div
        className={`mx-4 mt-3 rounded-xl border px-4 py-3 sm:mx-6 ${isDark
            ? 'border-slate-700 bg-slate-900/80'
            : 'border-slate-200 bg-white'
          }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isDark
                ? 'bg-[#167d91]/15 text-[#71c7d5]'
                : 'bg-[#eaf6f7] text-[#167d91]'
              }`}
          >
            <Loader2 size={17} className="animate-spin" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <FileText
                  size={13}
                  className={
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  }
                />

                <p
                  className={`truncate text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'
                    }`}
                >
                  {fileName || 'Document'}
                </p>
              </div>

              <span
                className={`shrink-0 text-[11px] font-medium tabular-nums ${isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}
              >
                {safeProgress}%
              </span>
            </div>

            <p
              className={`mt-1 text-[11px] leading-5 ${isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
            >
              {stage || 'Processing your document...'}
            </p>

            <div
              className={`mt-2.5 h-1.5 overflow-hidden rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'
                }`}
              role="progressbar"
              aria-label="Document processing progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={safeProgress}
            >
              <div
                className="h-full rounded-full bg-[#167d91] transition-all duration-300"
                style={{ width: `${safeProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div
        role="alert"
        className={`mx-4 mt-3 rounded-xl border px-4 py-3 sm:mx-6 ${isDark
            ? 'border-red-900/50 bg-red-950/20'
            : 'border-red-200 bg-white'
          }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isDark
                ? 'bg-red-950/50 text-red-400'
                : 'bg-red-50 text-red-600'
              }`}
          >
            <AlertCircle size={17} />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className={`text-xs font-semibold ${isDark ? 'text-red-300' : 'text-slate-800'
                }`}
            >
              Document processing failed
            </p>

            <p
              className={`mt-1 break-words text-[11px] leading-5 ${isDark ? 'text-red-300/80' : 'text-red-700'
                }`}
            >
              {error || 'Unable to process this PDF. Please try again.'}
            </p>

            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className={`mt-3 inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#167d91]/40 ${isDark
                    ? 'border-slate-700 bg-slate-900 text-slate-200 hover:border-[#167d91]/50 hover:bg-slate-800'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-[#167d91]/40 hover:text-[#126b7b]'
                  }`}
              >
                <RefreshCw size={13} />
                Try again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        className={`mx-4 mt-3 flex items-center gap-3 rounded-xl border px-4 py-3 sm:mx-6 ${isDark
            ? 'border-emerald-900/50 bg-emerald-950/20'
            : 'border-emerald-200 bg-white'
          }`}
      >
        <CheckCircle2
          size={18}
          className="shrink-0 text-emerald-600 dark:text-emerald-400"
        />

        <div className="min-w-0">
          <p
            className={`text-xs font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'
              }`}
          >
            Document ready
          </p>

          <p
            className={`mt-0.5 truncate text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
          >
            {fileName || 'Your PDF'} is ready to query.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
