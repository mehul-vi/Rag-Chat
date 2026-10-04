import { Menu, UploadCloud, Plus } from 'lucide-react';

export default function ChatHeader({
  fileName,
  documentId,
  isUploading,
  onOpenMobileMenu,
  onUploadClick,
  onNewChat,
}) {
  return (
    <header className="flex min-h-[68px] items-center justify-between border-b border-zinc-100 bg-white/95 px-4 backdrop-blur-sm sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          title="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 transition hover:bg-zinc-50 lg:hidden"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="max-w-[200px] truncate font-['Manrope'] text-sm font-extrabold tracking-tight text-zinc-900 sm:max-w-md sm:text-base">
              {fileName || 'PDF Assistant'}
            </h2>
            {documentId && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700">
                Ready
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[10px] text-zinc-400 sm:text-xs">
            {documentId
              ? 'Ask questions, extract data, or request summaries'
              : 'Upload a document to begin chatting'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="cursor-pointer" title="Upload or replace PDF">
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={onUploadClick}
            disabled={isUploading}
            className="hidden"
          />
          <span className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 shadow-2xs transition hover:bg-zinc-50 hover:text-zinc-900">
            <UploadCloud size={14} className="text-violet-600" />
            <span className="hidden sm:inline">{documentId ? 'Replace PDF' : 'Upload PDF'}</span>
          </span>
        </label>

        <button
          type="button"
          onClick={onNewChat}
          title="Start new chat"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-2xs transition hover:bg-zinc-50 hover:text-zinc-900"
        >
          <Plus size={17} />
        </button>
      </div>
    </header>
  );
}
