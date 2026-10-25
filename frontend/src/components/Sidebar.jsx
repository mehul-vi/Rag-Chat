import { FileText, X, LogOut, UserCircle2, Plus, History, Search, Trash2, Sun, Moon } from 'lucide-react';
import UploadArea from './UploadArea';

const formatHistoryDate = (value) => {
  if (!value) return 'Just now';
  let timestampMs = 0;
  if (typeof value === 'number') {
    timestampMs = value > 1e11 ? value : value * 1000;
  } else if (value.seconds) {
    timestampMs = value.seconds * 1000;
  } else if (value instanceof Date) {
    timestampMs = value.getTime();
  } else {
    const d = new Date(value);
    timestampMs = isNaN(d.getTime()) ? 0 : d.getTime();
  }

  if (!timestampMs) return 'Recently';

  const now = Date.now();
  const diffMinutes = Math.floor((now - timestampMs) / 60000);
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(timestampMs).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

export default function Sidebar({
  user,
  sessionHistory,
  activeSessionId,
  searchQuery,
  onChangeSearch,
  onSelectSession,
  onDeleteSession,
  onStartNewChat,
  onLogout,
  onCloseMobileMenu,
  isMobileMenuOpen,
  uploadStatus,
  fileName,
  uploadProgress,
  uploadStage,
  uploadError,
  onFileSelect,
  theme,
  onToggleTheme,
}) {
  const isDark = theme === 'dark';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-2 left-2 z-50 flex w-[290px] flex-col rounded-3xl border border-slate-200/80 bg-white p-3.5 shadow-2xl transition-transform duration-300 sm:inset-y-3 sm:left-3 lg:relative lg:inset-auto lg:z-auto lg:translate-x-0 lg:shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[120%]'
        }`}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between px-1.5 py-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-950">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                PDF Chat RAG
              </p>
              <p className="text-[10px] font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                Enterprise AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleTheme}
              title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200"
            >
              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
            </button>
            <button
              type="button"
              onClick={onCloseMobileMenu}
              title="Close sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:hidden dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
            >
              <X size={17} />
            </button>
            <button
              type="button"
              onClick={onLogout}
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-zinc-500 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="mt-3 flex items-center gap-2.5 rounded-2xl border border-slate-200/60 bg-slate-50 p-2.5 dark:border-zinc-800/60 dark:bg-zinc-900/60">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-600 shadow-2xs dark:bg-zinc-800 dark:text-zinc-300">
            <UserCircle2 size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Account</p>
            <p className="truncate text-xs font-semibold text-slate-800 dark:text-zinc-200" title={user?.email}>
              {user?.email || 'Guest User'}
            </p>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          type="button"
          onClick={onStartNewChat}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-600 hover:shadow-indigo-600/20 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-indigo-500 dark:hover:text-white"
        >
          <Plus size={15} /> New Chat Session
        </button>

        {/* Chat History Panel */}
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            <span className="flex items-center gap-1.5">
              <History size={13} /> Chat History
            </span>
            {sessionHistory.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                {sessionHistory.length}
              </span>
            )}
          </div>

          {sessionHistory.length > 3 && (
            <div className="relative mt-2">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Filter sessions..."
                value={searchQuery}
                onChange={(e) => onChangeSearch(e.target.value)}
                className="h-8.5 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-8 text-xs text-slate-800 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500 dark:focus:bg-zinc-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onChangeSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
            {sessionHistory.length === 0 ? (
              <div className="px-2 py-8 text-center">
                <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
                  {searchQuery ? 'No matching chats found.' : 'No saved sessions yet.'}
                </p>
                <p className="mt-1 text-[10px] text-slate-400 dark:text-zinc-500">
                  Upload a PDF to create your first session.
                </p>
              </div>
            ) : (
              sessionHistory.map((session) => {
                const isActive = activeSessionId === session.id;
                return (
                  <div
                    key={session.id}
                    onClick={() => onSelectSession(session)}
                    className={`group flex cursor-pointer items-center gap-2.5 rounded-xl border px-2.5 py-2 transition ${
                      isActive
                        ? 'border-indigo-500/30 bg-indigo-50/70 text-indigo-900 shadow-2xs dark:border-indigo-500/40 dark:bg-indigo-950/40 dark:text-indigo-200'
                        : 'border-transparent text-slate-700 hover:bg-slate-100/80 dark:text-zinc-300 dark:hover:bg-zinc-900'
                    }`}
                  >
                    <FileText
                      size={14}
                      className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-500'}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-xs font-semibold ${isActive ? 'text-indigo-950 dark:text-indigo-100' : 'text-slate-800 dark:text-zinc-200'}`}>
                        {session.title || session.fileName || 'PDF Document'}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">
                        {formatHistoryDate(session.updatedAt || session.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      title="Delete chat"
                      onClick={(e) => onDeleteSession(e, session.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 dark:text-zinc-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Upload Section */}
        <div className="mt-3 border-t border-slate-200/80 pt-3 dark:border-zinc-800/80">
          <p className="mb-2 px-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Document Context
          </p>
          <UploadArea
            status={uploadStatus}
            fileName={fileName}
            uploadProgress={uploadProgress}
            uploadStage={uploadStage}
            error={uploadError}
            onSelect={onFileSelect}
          />
        </div>
      </aside>
    </>
  );
}
