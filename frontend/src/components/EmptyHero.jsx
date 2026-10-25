import {
  UploadCloud,
  Loader2,
  FileText,
  AlertCircle,
  ShieldCheck,
  Search,
  ScanEye,
} from 'lucide-react';

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
      title: 'Contextual Retrieval',
      desc: 'High-density vector embeddings with Qdrant similarity search',
    },
    {
      icon: ShieldCheck,
      title: 'Page-Level Attribution',
      desc: 'Verify every statement against source page citations',
    },
    {
      icon: ScanEye,
      title: 'Multimodal OCR Fallback',
      desc: 'Automated Gemini Flash Vision extraction for scanned pages',
    },
  ];

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-4 py-8 text-center sm:px-6 sm:py-12">
      {/* Document Icon Badge */}
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-indigo-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-indigo-400">
        <FileText size={28} />
      </div>

      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-50/50 px-3 py-1 text-[11px] font-semibold text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-400">
        <span>RAG Document Intelligence</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-zinc-100">
        Query, Analyze, and Synthesize Any Document
      </h1>

      <p className="mt-2.5 max-w-lg text-xs leading-relaxed text-slate-500 sm:text-sm dark:text-zinc-400">
        Upload research papers, legal contracts, reports, or documentation. Extract structured data
        and receive answers backed by verifiable source citations.
      </p>

      {/* Main Upload Dropzone */}
      <div className="mt-8 w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white p-3 shadow-md shadow-slate-950/5 dark:border-zinc-800/80 dark:bg-zinc-900/90 dark:shadow-black/40">
        <label
          className={`group flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 transition-all ${
            isUploading
              ? 'cursor-wait border-indigo-400 bg-indigo-50/30 dark:border-indigo-500/50 dark:bg-indigo-950/20'
              : 'border-slate-200 bg-slate-50/50 hover:border-indigo-500/60 hover:bg-indigo-50/20 dark:border-zinc-800 dark:bg-zinc-950/50 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/30'
          }`}
        >
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={onSelectFile}
            disabled={isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  {uploadStage || 'Processing document...'}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                  Chunking text & computing 768-dim embeddings
                </p>
              </div>
              <div className="h-1.5 w-48 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                  style={{ width: `${uploadProgress || 35}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-indigo-600 shadow-2xs transition group-hover:scale-105 group-hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-indigo-400">
                <UploadCloud size={22} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 dark:text-zinc-100 dark:group-hover:text-indigo-400">
                  Click to browse or drop PDF here
                </p>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-zinc-500">
                  PDF up to 15MB • Text & Scanned OCR Supported
                </p>
              </div>
            </div>
          )}
        </label>

        {uploadError && (
          <div className="mt-2.5 flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-medium text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <AlertCircle size={14} className="shrink-0" />
            <span className="truncate">{uploadError}</span>
          </div>
        )}
      </div>

      {/* Feature Micro-Grid */}
      <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
        {capabilities.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs transition hover:border-slate-300 dark:border-zinc-800/80 dark:bg-zinc-900/60 dark:hover:border-zinc-700"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                <Icon size={14} />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-900 dark:text-zinc-200">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400 dark:text-zinc-500">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
