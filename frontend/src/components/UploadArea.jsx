
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const MAX_FILE_SIZE_MB = 10;

export default function UploadArea({
  status,
  fileName,
  uploadProgress,
  uploadStage,
  error,
  onSelect,
}) {
  const isUploading = status === 'uploading';
  const isSuccess = status === 'success';
  const isError = status === 'error';

  const progress = Math.min(
    100,
    Math.max(0, Number(uploadProgress) || 45)
  );

  const containerStyle = isSuccess
    ? 'border-emerald-500/30 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-950/20'
    : isError
      ? 'border-red-500/30 bg-red-50/40 dark:border-red-500/20 dark:bg-red-950/20'
      : isUploading
        ? 'cursor-wait border-[#167d91]/35 bg-[#eaf6f7]/60 dark:border-[#167d91]/40 dark:bg-[#167d91]/10'
        : 'border-slate-200 bg-slate-50/70 hover:border-[#167d91]/40 hover:bg-[#eaf6f7]/50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-[#167d91]/40 dark:hover:bg-[#167d91]/10';

  return (
    <label
      className={`
        group block rounded-2xl border p-3
        transition-all duration-200
        ${isUploading ? 'cursor-wait' : 'cursor-pointer'}
        ${containerStyle}
      `}
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={onSelect}
        disabled={isUploading}
        className="sr-only"
        aria-label="Upload PDF document"
      />

      {isUploading ? (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#167d91]/15 bg-[#eaf6f7] text-[#167d91] dark:border-[#167d91]/30 dark:bg-[#167d91]/15 dark:text-[#71c7d5]">
            <Loader2 size={18} className="animate-spin" />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[11px] font-semibold text-slate-800 dark:text-slate-100"
              title={fileName}
            >
              {fileName || 'Processing document...'}
            </p>

            <p className="mt-0.5 truncate text-[10px] font-medium text-[#167d91] dark:text-[#71c7d5]">
              {uploadStage || 'Extracting and indexing...'}
            </p>

            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800"
              role="progressbar"
              aria-label="PDF upload progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div
                className="h-full rounded-full bg-[#167d91] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <span className="shrink-0 text-[10px] font-semibold tabular-nums text-slate-500 dark:text-slate-400">
            {progress}%
          </span>
        </div>
      ) : isSuccess ? (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[11px] font-semibold text-emerald-800 dark:text-emerald-300"
              title={fileName}
            >
              {fileName || 'Document ready'}
            </p>

            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              Ready to ask questions · Click to replace
            </p>
          </div>

          <UploadCloud
            size={15}
            className="shrink-0 text-slate-400 dark:text-slate-500"
          />
        </div>
      ) : isError ? (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
            <AlertCircle size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-red-700 dark:text-red-400">
              {error || 'Upload failed'}
            </p>

            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              Click to try again
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#167d91] transition-transform duration-200 group-hover:scale-105 dark:border-slate-700 dark:bg-slate-800 dark:text-[#71c7d5]">
            <UploadCloud size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">
              Upload PDF document
            </p>

            <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              PDF up to {MAX_FILE_SIZE_MB} MB · OCR enabled
            </p>
          </div>

          <span className="text-[10px] font-medium text-slate-400 transition-colors group-hover:text-[#167d91] dark:text-slate-500 dark:group-hover:text-[#71c7d5]">
            Browse
          </span>
        </div>
      )}
    </label>
  );
}
