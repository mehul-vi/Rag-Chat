import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadArea({
  status,
  fileName,
  uploadProgress,
  uploadStage,
  error,
  onSelect,
}) {
  const isUploading = status === 'uploading';

  return (
    <label
      className={`group block cursor-pointer rounded-2xl border p-3 transition-all duration-200 ${
        status === 'success'
          ? 'border-emerald-500/30 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-950/20 shadow-xs'
          : status === 'error'
          ? 'border-red-500/30 bg-red-50/50 dark:border-red-500/20 dark:bg-red-950/20 shadow-xs'
          : isUploading
          ? 'cursor-wait border-indigo-500/40 bg-indigo-50/40 dark:border-indigo-500/30 dark:bg-indigo-950/30 shadow-xs'
          : 'border-slate-200/90 bg-slate-50/60 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/40'
      }`}
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={onSelect}
        disabled={isUploading}
        className="hidden"
      />

      {isUploading ? (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
            <Loader2 size={18} className="animate-spin" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-slate-900 dark:text-zinc-100">
              {fileName || 'Processing document...'}
            </p>
            <p className="mt-0.5 truncate text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
              {uploadStage || 'Extracting & embedding...'}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                style={{ width: `${uploadProgress || 45}%` }}
              />
            </div>
          </div>
        </div>
      ) : status === 'success' ? (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-emerald-800 dark:text-emerald-300" title={fileName}>
              {fileName}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-zinc-400">Click to replace PDF</p>
          </div>
        </div>
      ) : status === 'error' ? (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500 dark:bg-red-950/60 dark:text-red-400">
            <AlertCircle size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-red-600 dark:text-red-400">{error || 'Upload failed'}</p>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-zinc-400">Click to retry</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-2xs dark:bg-zinc-800 dark:text-indigo-400 transition group-hover:scale-105">
            <UploadCloud size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">Upload PDF Document</p>
            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-zinc-400">PDF up to 15MB • OCR enabled</p>
          </div>
        </div>
      )}
    </label>
  );
}
