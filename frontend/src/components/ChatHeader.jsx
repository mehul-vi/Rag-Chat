import { Plus, X, Sun, Moon, Menu, MessageSquare, FileText, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function ChatHeader({
  documents = [], activeDocId, activeDoc, onSelectDoc, onCloseDocTab,
  onNewDocTab, theme, onToggleTheme, onOpenMobileMenu, isSidebarOpen, onToggleSidebar, mobileView, onChangeMobileView,
}) {
  return (
    <header className="relative z-20 shrink-0 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="flex h-[64px] items-center gap-3 px-3 sm:px-5 lg:h-[72px] lg:px-6">
        <button
          type="button"
          onClick={onToggleSidebar || onOpenMobileMenu}
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
          title={isSidebarOpen ? 'Collapse sidebar' : 'Open sidebar'}
          className="icon-button border-[var(--border)] bg-[var(--surface-raised)]"
        >
          {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
            <span>Workspace</span><ChevronRight size={11} /><span>{activeDoc ? 'Analysis' : 'New analysis'}</span>
          </div>
          <h1 className="mt-0.5 truncate text-sm font-semibold tracking-[-0.01em] sm:text-[15px]">{activeDoc ? activeDoc.title || activeDoc.fileName : 'Document intelligence'}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button type="button" onClick={onNewDocTab} className="secondary-button !min-h-[40px] !px-3 max-sm:!w-10 max-sm:!px-0" title="Upload a PDF"><Plus size={16} /><span className="hidden sm:inline">Upload PDF</span></button>
          <button type="button" onClick={onToggleTheme} className="icon-button border-[var(--border)] bg-[var(--surface-raised)]" aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      {documents.length > 0 && (
        <div className="flex h-[48px] items-center border-t border-[var(--border)] pr-2">
          <div className="no-scrollbar flex min-w-0 flex-1 items-end gap-1 self-stretch overflow-x-auto px-2 sm:px-4" role="tablist" aria-label="Open documents">
            {documents.map((doc) => {
              const selected = doc.id === activeDocId;
              return (
                <div key={doc.id} className={`group relative flex h-full shrink-0 items-center border-b-2 ${selected ? 'border-[var(--accent)]' : 'border-transparent'}`} role="presentation">
                  <button type="button" role="tab" aria-selected={selected} onClick={() => onSelectDoc(doc)} className={`flex h-full max-w-[180px] items-center gap-2 px-3 text-xs font-medium transition-colors sm:max-w-[220px] ${selected ? 'text-[var(--accent-ink)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`} title={doc.title || doc.fileName}>
                    <FileText size={13} className="shrink-0" /><span className="truncate">{doc.title || doc.fileName}</span>
                  </button>
                  <button type="button" onClick={() => onCloseDocTab(doc.id)} className="icon-button !h-7 !w-7 opacity-60 focus-visible:opacity-100 group-hover:opacity-100 lg:opacity-0" aria-label={`Close ${doc.title || doc.fileName}`} title="Close document"><X size={12} /></button>
                </div>
              );
            })}
          </div>

          <div className="ml-2 flex shrink-0 items-center rounded-lg bg-[var(--surface-subtle)] p-1 lg:hidden" role="group" aria-label="Mobile workspace view">
            <button type="button" onClick={() => onChangeMobileView('chat')} aria-pressed={mobileView === 'chat'} className={`flex min-h-[32px] items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors ${mobileView === 'chat' ? 'bg-[var(--surface-raised)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)]'}`}><MessageSquare size={12} />Chat</button>
            <button type="button" onClick={() => onChangeMobileView('doc')} aria-pressed={mobileView === 'doc'} className={`flex min-h-[32px] items-center gap-1.5 rounded-md px-2.5 text-[11px] font-medium transition-colors ${mobileView === 'doc' ? 'bg-[var(--surface-raised)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)]'}`}><FileText size={12} />Document</button>
          </div>
        </div>
      )}
    </header>
  );
}
