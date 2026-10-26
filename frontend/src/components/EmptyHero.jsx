
import {
  UploadCloud,
  Loader2,
  FileText,
  AlertCircle,
  ShieldCheck,
  Search,
  ScanEye,
} from 'lucide-react';

const MAX_FILE_SIZE_MB = 10;

export default function EmptyHero({
  onSelectFile,
  isUploading,
  uploadStage,
  uploadProgress,
  uploadError,
}) {
  const capabilities = [
    {
      icon: Search,
      title: 'Contextual Search',
      desc: 'Find relevant passages using semantic vector search.',
    },
    {
      icon: ShieldCheck,
      title: 'Verifiable Answers',
      desc: 'Trace answers back to their original document pages.',
    },
    {
      icon: ScanEye,
      title: 'Scanned PDF Support',
      desc: 'Extract information from supported scanned pages.',
    },
  ];

  const progress = Math.max(
    0,
    Math.min(100, Number(uploadProgress) || 0)
  );

  return (
    <section className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center px-4 py-10 text-center sm:px-8 sm:py-12">
      {/* Product label */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#d4ebee] bg-[#eaf6f7] px-3 py-1.5 dark:border-[#167d91]/30 dark:bg-[#167d91]/10">
        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#167d91] text-white">
          <FileText size={12} />
        </span>

        <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#126b7b] dark:text-[#8bd8e3]">
          Document Intelligence
        </span>
      </div>

      {/* Hero heading */}
      <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-[-0.04em] text-slate-900 sm:text-4xl sm:leading-[1.15] dark:text-slate-100">
        Understand your documents.
        <span className="mt-1 block text-[#167d91]">
          Find answers faster.
        </span>
      </h1>

      <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base dark:text-slate-400">
        Upload a PDF, ask questions in plain language, and explore
        answers grounded in your document with page-level citations.
      </p>

      {/* Upload panel */}
      <div className="mt-8 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-2.5 shadow-[0_12px_40px_rgba(15,23,42,0.05)] dark:border-slate-700 dark:bg-slate-900">
        <label
          className={`
            group flex min-h-[190px] flex-col items-center justify-center
            rounded-xl border border-dashed p-6 transition-all duration-200
            ${isUploading
              ? 'cursor-wait border-[#167d91]/50 bg-[#eaf6f7]/60 dark:border-[#167d91]/50 dark:bg-slate-950'
              : 'cursor-pointer border-slate-300 bg-slate-50 hover:border-[#167d91]/60 hover:bg-[#eaf6f7]/50 dark:border-slate-700 dark:bg-slate-950/60 dark:hover:border-[#167d91]/60 dark:hover:bg-slate-900'
            }
          `}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={onSelectFile}
            disabled={isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex w-full flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#d4ebee] bg-white text-[#167d91] dark:border-slate-700 dark:bg-slate-900 dark:text-[#71c7d5]">
                <Loader2 size={23} className="animate-spin" />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {uploadStage || 'Processing your document...'}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Extracting and indexing document content
                </p>
              </div>

              <div
                className="mt-1 h-1.5 w-full max-w-[240px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
                role="progressbar"
                aria-label="Document upload progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <div
                  className="h-full rounded-full bg-[#167d91] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <span className="text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                {progress}%
              </span>
            </div>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#167d91] shadow-sm transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:border-[#167d91]/40 dark:border-slate-700 dark:bg-slate-900 dark:text-[#71c7d5]">
                <UploadCloud size={23} strokeWidth={1.8} />
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-800 transition-colors group-hover:text-[#167d91] dark:text-slate-100 dark:group-hover:text-[#71c7d5]">
                Drop your PDF here or browse files
              </p>

              <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Select a document from your device to begin
              </p>

              <span className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors group-hover:border-[#167d91]/40 group-hover:text-[#126b7b] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:group-hover:text-[#8bd8e3]">
                <FileText size={13} />
                Browse PDF
              </span>

              <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500">
                PDF format · Maximum size {MAX_FILE_SIZE_MB} MB
              </p>
            </>
          )}
        </label>

        {uploadError && (
          <div
            role="alert"
            className="mt-3 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-left text-xs leading-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
          >
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* Capabilities */}
      <div className="mt-10 w-full max-w-3xl">
        <div className="mb-4 flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />

          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
            Built for document research
          </p>

          <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
          {capabilities.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-4 transition-colors duration-200 hover:border-[#167d91]/30 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-[#167d91]/40"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e5f4f6] text-[#167d91] dark:bg-[#167d91]/15 dark:text-[#71c7d5]">
                  <Icon size={17} strokeWidth={1.8} />
                </div>

                <h3 className="mt-4 text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
                  {item.title}
                </h3>

                <p className="mt-1.5 text-xs leading-6 text-slate-500 dark:text-slate-400">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
