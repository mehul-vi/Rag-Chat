import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export default function UploadBanner({
  status,
  fileName,
  stage,
  progress,
  error,
  onRetry,
}) {
  if (status === 'idle') return null;

  if (status === 'uploading') {
    return (
      <div className="mx-4 mt-3 rounded-2xl border border-indigo-200/60 bg-indigo-50/60 px-4 py-3 shadow-xs sm:mx-6 dark:border-indigo-900/40 dark:bg-indigo-950/30">
        <div className="flex items-center gap-3">
          <Loader2 size={18} className="shrink-0 animate-spin text-indigo-600 dark:text-indigo-400" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-900 dark:text-zinc-100">
              Processing &quot;{fileName || 'Document'}&quot;
            </p>
            <p className="mt-0.5 truncate text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
              {stage || 'Chunking text and generating vector embeddings...'}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-4 mt-3 flex items-center justify-between gap-3 rounded-2xl border border-red-500/30 bg-red-50/80 px-4 py-3 shadow-xs sm:mx-6 dark:border-red-900/40 dark:bg-red-950/30">
        <div className="flex min-w-0 items-center gap-3">
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-red-800 dark:text-red-300">Upload Failed</p>
            <p className="truncate text-[11px] text-red-600 dark:text-red-400">
              {error || 'Unable to parse PDF. Please try another document.'}
            </p>
          </div>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-2xs transition hover:bg-red-50 dark:border-red-800 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-zinc-800"
          >
            <RefreshCw size={12} /> Retry
          </button>
        )}
      </div>
    );
  }

  return null;
}
