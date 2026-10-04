import { FileText, X, LogOut, UserCircle2, Plus, History, Search, Trash2 } from 'lucide-react';
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
}) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/20 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-2 left-2 z-50 flex w-[290px] flex-col rounded-3xl border border-zinc-200/80 bg-white p-3 shadow-2xl transition-transform duration-300 sm:inset-y-3 sm:left-3 lg:relative lg:inset-auto lg:z-auto lg:translate-x-0 lg:shadow-xs ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-[120%]'
        }`}
      >
        {/* Header / Logo */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="PDF Chat AI Logo" className="h-9 w-9 rounded-xl shadow-xs" />
            <div>
              <p className="font-['Manrope'] text-sm font-extrabold tracking-tight text-zinc-900">
                PDF Chat AI
              </p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-violet-600">
                Smart Document RAG
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onCloseMobileMenu}
              title="Close sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 lg:hidden"
            >
              <X size={17} />
            </button>
            <button
              type="button"
              onClick={onLogout}
              title="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* User Card */}
        <div className="mt-3.5 flex items-center gap-2.5 rounded-2xl border border-zinc-100 bg-zinc-50 p-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-zinc-600 shadow-xs">
            <UserCircle2 size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Signed in</p>
            <p className="truncate text-xs font-semibold text-zinc-800" title={user?.email}>
              {user?.email}
            </p>
          </div>
        </div>

        {/* New Chat Button */}
        <button
          type="button"
          onClick={onStartNewChat}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 text-xs font-bold text-white shadow-sm transition hover:bg-violet-600 hover:shadow-violet-600/20"
        >
          <Plus size={15} /> New Chat
        </button>

        {/* Chat History Panel */}
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <span className="flex items-center gap-1.5">
              <History size={13} /> Chat History
            </span>
            {sessionHistory.length > 0 && (
              <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[9px] font-semibold text-zinc-600">
                {sessionHistory.length}
              </span>
            )}
          </div>

          {sessionHistory.length > 3 && (
            <div className="relative mt-2">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => onChangeSearch(e.target.value)}
                className="h-8.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-8 pr-8 text-xs text-zinc-800 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-500/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onChangeSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          <div className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
            {sessionHistory.length === 0 ? (
              <div className="px-2 py-8 text-center">
                <p className="text-xs font-medium text-zinc-500">
                  {searchQuery ? 'No matching chats found.' : 'No saved chats yet.'}
                </p>
                <p className="mt-1 text-[10px] text-zinc-400">
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
                        ? 'border-violet-200 bg-violet-50 text-violet-700 shadow-2xs'
                        : 'border-transparent text-zinc-700 hover:bg-zinc-50'
                    }`}
                  >
                    <FileText
                      size={14}
                      className={isActive ? 'text-violet-600' : 'text-zinc-400'}
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-xs font-semibold ${isActive ? 'text-violet-950' : 'text-zinc-800'}`}>
                        {session.title || session.fileName || 'PDF Document'}
                      </p>
                      <p className="mt-0.5 text-[10px] text-zinc-400">
                        {formatHistoryDate(session.updatedAt || session.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      title="Delete chat"
                      onClick={(e) => onDeleteSession(e, session.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
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
        <div className="mt-3 border-t border-zinc-100 pt-3">
          <p className="mb-2 px-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
            Upload PDF
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
