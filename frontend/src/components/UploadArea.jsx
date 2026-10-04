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
      className={`group block cursor-pointer rounded-2xl border p-3.5 transition-all duration-200 ${
        status === 'success'
          ? 'border-emerald-200 bg-emerald-50/60 shadow-xs'
          : status === 'error'
          ? 'border-red-200 bg-red-50/60 shadow-xs'
          : isUploading
          ? 'cursor-wait border-violet-300 bg-violet-50/50 shadow-xs'
          : 'border-zinc-200/90 bg-zinc-50/70 hover:border-violet-300 hover:bg-violet-50/40 hover:shadow-xs'
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
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
            <Loader2 size={19} className="animate-spin" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-zinc-800">
              {fileName || 'Processing document...'}
            </p>
            <p className="mt-0.5 truncate text-[9px] font-medium text-violet-600">
              {uploadStage || 'Uploading & parsing...'}
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/80">
              <div
                className="h-full rounded-full bg-violet-600 transition-all duration-300"
                style={{ width: `${uploadProgress || 45}%` }}
              />
            </div>
          </div>
        </div>
      ) : status === 'success' ? (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-emerald-800" title={fileName}>
              {fileName}
            </p>
            <p className="mt-0.5 text-[9px] text-zinc-500">Click to replace PDF</p>
          </div>
        </div>
      ) : status === 'error' ? (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-500">
            <AlertCircle size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-red-600">{error || 'Upload failed'}</p>
            <p className="mt-0.5 text-[9px] text-zinc-500">Click to try again</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm transition group-hover:scale-105">
            <UploadCloud size={19} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-zinc-800">Upload PDF Document</p>
            <p className="mt-0.5 text-[9px] text-zinc-500">PDF up to 10MB • Text extracted</p>
          </div>
        </div>
      )}
    </label>
  );
}
