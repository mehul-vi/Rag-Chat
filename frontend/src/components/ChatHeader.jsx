import { Menu, UploadCloud, Plus, Sun, Moon } from 'lucide-react';

export default function ChatHeader({
  fileName,
  documentId,
  isUploading,
  onOpenMobileMenu,
  onUploadClick,
  onNewChat,
  theme,
  onToggleTheme,
}) {
  const isDark = theme === 'dark';

  return (
    <header className="flex min-h-[64px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md transition-colors sm:px-6 dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          title="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="max-w-[200px] truncate text-sm font-bold tracking-tight text-slate-900 sm:max-w-md sm:text-base dark:text-zinc-100">
              {fileName || 'Document Assistant'}
            </h2>
            {documentId ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Active
              </span>
            ) : (
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                No Document
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-[11px] text-slate-500 sm:text-xs dark:text-zinc-400">
            {documentId
              ? 'Query passages, summarize sections, and extract key metrics'
              : 'Upload a PDF to start analyzing with citations'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-600" />}
        </button>

        {/* Upload / Replace PDF */}
        <label className="cursor-pointer" title="Upload or replace PDF">
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={onUploadClick}
            disabled={isUploading}
            className="hidden"
          />
          <span className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-zinc-100">
            <UploadCloud size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">{documentId ? 'Replace PDF' : 'Upload PDF'}</span>
          </span>
        </label>

        {/* New Chat */}
        <button
          type="button"
          onClick={onNewChat}
          title="Start new chat"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-100 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
          <Plus size={17} />
        </button>
      </div>
    </header>
  );
}
