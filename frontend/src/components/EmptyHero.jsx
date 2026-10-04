import {
  UploadCloud,
  Loader2,
  ArrowRight,
  AlertCircle,
  Layers,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function EmptyHero({
  onSelectFile,
  isUploading,
  uploadStage,
  uploadProgress,
  uploadError,
}) {
  const features = [
    {
      icon: Layers,
      title: 'Semantic RAG',
      desc: 'Context-aware document chunking and vector retrieval',
    },
    {
      icon: CheckCircle2,
      title: 'Page Citations',
      desc: 'Trace answers directly back to source page numbers',
    },
    {
      icon: Sparkles,
      title: 'AI Analysis',
      desc: 'Summarize, calculate, and extract tables and insights',
    },
  ];

  return (
    <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center justify-center px-4 py-8 text-center sm:px-6 sm:py-12">
      <div className="mb-5 flex items-center justify-center">
        <img
          src="/logo.svg"
          alt="PDF Chat AI Logo"
          className="h-16 w-16 rounded-2xl shadow-lg shadow-violet-500/20"
        />
      </div>

      <p className="mb-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-violet-600">
        Smart Document Intelligence
      </p>

      <h2 className="font-['Manrope'] text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-4xl">
        Chat with any PDF Document.
      </h2>

      <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-500">
        Upload research papers, contracts, study notes, or reports. Ask questions and get instant,
        accurate answers with page-level citations.
      </p>

      <div className="mt-8 w-full max-w-lg rounded-3xl border border-zinc-200/90 bg-white p-2.5 shadow-xl shadow-zinc-950/5">
        <label
          className={`block rounded-2xl border-2 border-dashed p-8 transition-all ${
            isUploading
              ? 'cursor-wait border-violet-200 bg-violet-50/40'
              : 'cursor-pointer border-zinc-200 bg-zinc-50/60 hover:border-violet-400 hover:bg-violet-50/30'
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
            <div className="flex flex-col items-center">
              <Loader2 size={36} className="animate-spin text-violet-600" />
              <p className="mt-4 text-sm font-bold text-zinc-800">Processing your PDF...</p>
              <p className="mt-1 text-xs text-zinc-400">
                {uploadStage || 'Generating vector embeddings'}
              </p>
              <div className="mt-5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-violet-100">
                <div
                  className="h-full rounded-full bg-violet-600 transition-all duration-500"
                  style={{ width: `${uploadProgress || 50}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-md shadow-zinc-200 transition-transform duration-200 group-hover:scale-105">
                <UploadCloud size={28} />
              </div>
              <p className="mt-4 text-sm font-bold text-zinc-800">Drop your PDF file here</p>
              <p className="mt-1 text-xs text-zinc-400">or click to browse from your device</p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-violet-600 hover:shadow-violet-500/25">
                Select PDF <ArrowRight size={14} />
              </span>
            </div>
          )}
        </label>

        {uploadError && (
          <div className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-red-600">
            <AlertCircle size={15} />
            {uploadError}
          </div>
        )}
      </div>

      <div className="mt-6 grid w-full max-w-lg grid-cols-1 gap-2.5 sm:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-zinc-200/80 bg-white p-4 text-left shadow-xs transition hover:border-violet-200"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Icon size={16} />
            </div>
            <p className="mt-3 text-xs font-bold text-zinc-800">{title}</p>
            <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
