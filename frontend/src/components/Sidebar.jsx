import { useEffect, useRef, useState } from 'react';
import {
  FileText, Star, ChevronDown, Settings, HelpCircle, X, Plus, Trash2,
  Files, LogOut, Sun, Moon, Check, Upload, Sparkles,
} from 'lucide-react';

export default function Sidebar({
  user, onUpdateUser, documents = [], activeDocId, onSelectDoc,
  onCloseMobileMenu, isMobileMenuOpen, onStartNewUpload, onDeleteDoc,
  onToggleFavourite, theme, onToggleTheme, onLogout,
}) {
  const [filter, setFilter] = useState('recent');
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [workspace, setWorkspace] = useState('Personal workspace');
  const [modal, setModal] = useState(null);
  const workspaceRef = useRef(null);
  const workspaces = ['Personal workspace', 'Research library', 'Legal & contracts'];
  const visibleDocuments = filter === 'starred' ? documents.filter((doc) => doc.isFavourite) : documents;
  const initials = (user?.displayName || user?.email || 'U').slice(0, 1).toUpperCase();

  useEffect(() => {
    const close = (event) => {
      if (workspaceRef.current && !workspaceRef.current.contains(event.target)) setWorkspaceMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <>
      {isMobileMenuOpen && (
        <button type="button" aria-label="Close navigation" onClick={onCloseMobileMenu} className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] lg:hidden" />
      )}

      <aside
        id="app-sidebar"
        aria-label="Workspace navigation"
        className={`fixed inset-y-0 left-0 z-50 flex w-[290px] max-w-[calc(100vw-32px)] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-200 ease-out lg:static lg:z-auto lg:w-[272px] lg:max-w-none lg:translate-x-0 lg:rounded-l-xl lg:border lg:border-r-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[var(--border)] px-5">
          <div className="flex items-center gap-2.5">
            <FileText size={22} strokeWidth={1.8} className="text-[var(--accent)]" />
            <div>
              <p className="text-[17px] font-bold leading-5 tracking-[-0.025em]">DocAnalyzer</p>
              <p className="font-ui-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)]">Document workspace</p>
            </div>
          </div>
          <button type="button" onClick={onCloseMobileMenu} className="icon-button lg:hidden" aria-label="Close sidebar"><X size={18} /></button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
          <button type="button" onClick={onStartNewUpload} className="primary-button mx-2 mb-5 w-[calc(100%-16px)] justify-between">
            <span className="flex items-center gap-2"><Plus size={16} /> New document</span>
            <Upload size={14} className="opacity-70" />
          </button>

          <div className="mx-2 grid grid-cols-2 border-b border-[var(--border)]" role="tablist" aria-label="Document filter">
            {[{ id: 'recent', label: 'Recent', icon: Files }, { id: 'starred', label: 'Starred', icon: Star }].map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={`relative flex min-h-[42px] items-center justify-center gap-2 text-xs font-medium transition-colors ${filter === item.id ? 'text-[var(--accent-ink)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
              >
                <item.icon size={14} />{item.label}
                {filter === item.id && <span className="absolute inset-x-2 bottom-[-1px] h-0.5 bg-[var(--accent)]" />}
              </button>
            ))}
          </div>

          <div className="mb-2 mt-5 flex items-center justify-between px-3">
            <span className="ui-label text-[var(--text-muted)]">{filter === 'recent' ? 'Your library' : 'Saved documents'}</span>
            <span className="font-ui-mono text-[10px] text-[var(--text-muted)]">{visibleDocuments.length.toString().padStart(2, '0')}</span>
          </div>

          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-1">
            {visibleDocuments.length === 0 ? (
              <div className="mx-2 mt-2 border border-dashed border-[var(--border)] px-4 py-7 text-center">
                <FileText size={19} strokeWidth={1.5} className="mx-auto text-[var(--text-muted)]" />
                <p className="mt-3 text-xs font-medium text-[var(--text-secondary)]">{filter === 'starred' ? 'No starred documents' : 'Your library is empty'}</p>
                <p className="mt-1 text-[11px] leading-5 text-[var(--text-muted)]">{filter === 'starred' ? 'Star a document to keep it close.' : 'Upload a PDF to start a conversation.'}</p>
              </div>
            ) : visibleDocuments.map((doc) => {
              const selected = doc.id === activeDocId;
              return (
                <div key={doc.id} className={`group relative mb-1 flex items-center rounded-lg transition-colors ${selected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--surface-subtle)]'}`}>
                  <button type="button" onClick={() => onSelectDoc(doc)} className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-3 text-left">
                    <FileText size={15} className={selected ? 'shrink-0 text-[var(--accent)]' : 'shrink-0 text-[var(--text-muted)]'} />
                    <span className={`truncate text-[13px] ${selected ? 'font-semibold text-[var(--accent-ink)]' : 'text-[var(--text-secondary)]'}`}>{doc.title || doc.fileName}</span>
                  </button>
                  <div className="flex shrink-0 items-center pr-1">
                    <button type="button" onClick={() => onToggleFavourite?.(doc.id)} className="icon-button !h-8 !w-8" title={doc.isFavourite ? 'Remove from starred' : 'Add to starred'} aria-label={doc.isFavourite ? `Unstar ${doc.title}` : `Star ${doc.title}`}>
                      <Star size={13} className={doc.isFavourite ? 'fill-[var(--accent)] text-[var(--accent)]' : ''} />
                    </button>
                    <button type="button" onClick={() => onDeleteDoc?.(doc.id)} className="icon-button !h-8 !w-8 opacity-60 hover:!text-[var(--danger)] focus-visible:opacity-100 group-hover:opacity-100 lg:opacity-0" title="Remove document" aria-label={`Remove ${doc.title}`}><Trash2 size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="shrink-0 border-t border-[var(--border)] p-3">
          <div className="mx-1 mb-3 px-2 py-1">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs font-semibold"><Sparkles size={14} className="text-[var(--accent)]" /> Premium trial</span>
              <span className="font-ui-mono text-[10px] text-[var(--accent-ink)]">6 DAYS</span>
            </div>
            <button type="button" onClick={() => setModal('trial')} className="mt-1 text-[11px] text-[var(--text-muted)] underline-offset-4 hover:text-[var(--accent-ink)] hover:underline">View plan details</button>
          </div>

          <div className="relative" ref={workspaceRef}>
            <button type="button" onClick={() => setWorkspaceMenuOpen((open) => !open)} aria-expanded={workspaceMenuOpen} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-[var(--surface-subtle)]">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent-ink)]">{initials}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">{workspace}</span>
                <span className="block truncate text-[10px] text-[var(--text-muted)]">{user?.email}</span>
              </span>
              <ChevronDown size={14} className={`shrink-0 text-[var(--text-muted)] transition-transform ${workspaceMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {workspaceMenuOpen && (
              <div className="modal-panel absolute bottom-full left-0 z-30 mb-2 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface-raised)] p-1.5 shadow-[var(--shadow-soft)]">
                <p className="ui-label px-2 py-2 text-[var(--text-muted)]">Switch workspace</p>
                {workspaces.map((item) => (
                  <button key={item} type="button" onClick={() => { setWorkspace(item); setWorkspaceMenuOpen(false); }} className="flex min-h-[40px] w-full items-center justify-between rounded-md px-2.5 text-left text-xs text-[var(--text-secondary)] hover:bg-[var(--surface-subtle)]">
                    {item}{workspace === item && <Check size={13} className="text-[var(--accent)]" />}
                  </button>
                ))}
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => { setWorkspaceMenuOpen(false); onLogout(); }}
                    className="mt-1 flex min-h-[38px] w-full items-center gap-2 border-t border-[var(--border)] px-2.5 pt-1 text-left text-xs text-[var(--danger)] hover:bg-[var(--surface-subtle)]"
                  >
                    <LogOut size={13} />Log out
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-1 border-t border-[var(--border)] pt-2">
            <button type="button" onClick={() => setModal('settings')} className="flex min-h-[40px] items-center justify-center gap-2 rounded-md text-xs text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]"><Settings size={14} />Settings</button>
            <button type="button" onClick={() => setModal('help')} className="flex min-h-[40px] items-center justify-center gap-2 rounded-md text-xs text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]"><HelpCircle size={14} />Help</button>
            <button type="button" onClick={onToggleTheme} className="icon-button !h-10 !w-10" aria-label={theme === 'dark' ? 'Use light theme' : 'Use dark theme'}>{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}</button>
          </div>
        </div>
      </aside>

      {modal === 'trial' && (
        <Modal title="Premium trial" onClose={() => setModal(null)}>
          <div className="border-y border-[var(--border)] py-4">
            <div className="flex justify-between text-sm"><span className="text-[var(--text-muted)]">Current plan</span><strong>Premium trial</strong></div>
            <div className="mt-3 flex justify-between text-sm"><span className="text-[var(--text-muted)]">Time remaining</span><strong className="text-[var(--accent-ink)]">6 days</strong></div>
          </div>
          <ul className="mt-5 space-y-3 text-sm text-[var(--text-secondary)]">
            {['Unlimited PDF parsing and indexing', 'Semantic document search', 'Answers with page-level citations', 'Multi-document workspace'].map((item) => <li key={item} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />{item}</li>)}
          </ul>
          <button type="button" onClick={() => setModal(null)} className="primary-button mt-6 w-full">Done</button>
        </Modal>
      )}

      {modal === 'settings' && (
        <SettingsModal user={user} onUpdateUser={onUpdateUser} theme={theme} onToggleTheme={onToggleTheme} onClose={() => setModal(null)} onLogout={onLogout} />
      )}

      {modal === 'help' && (
        <Modal title="Help & shortcuts" onClose={() => setModal(null)}>
          <div className="space-y-5 text-sm">
            <div><h3 className="font-semibold">Start a conversation</h3><p className="mt-1 leading-6 text-[var(--text-secondary)]">Upload a PDF, wait for indexing, then ask about themes, figures, dates, or conclusions.</p></div>
            <div><h3 className="font-semibold">Check the evidence</h3><p className="mt-1 leading-6 text-[var(--text-secondary)]">Open a source citation to read its excerpt, or use the document preview to inspect the original.</p></div>
            <div className="border-t border-[var(--border)] pt-4"><span className="ui-label text-[var(--text-muted)]">Keyboard</span><div className="mt-3 flex justify-between text-xs"><span>Send message</span><kbd className="font-ui-mono">Enter</kbd></div><div className="mt-2 flex justify-between text-xs"><span>New line</span><kbd className="font-ui-mono">Shift + Enter</kbd></div></div>
          </div>
          <button type="button" onClick={() => setModal(null)} className="secondary-button mt-6 w-full">Close</button>
        </Modal>
      )}
    </>
  );
}

function Modal({ title, onClose, children }) {
  const panelRef = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const onKey = (event) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => { document.removeEventListener('keydown', onKey); previous?.focus?.(); };
  }, [onClose]);
  return (
    <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className="modal-panel max-h-[90dvh] w-full max-w-[440px] overflow-y-auto rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] p-6 shadow-[var(--shadow-soft)]">
        <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold tracking-[-0.02em]">{title}</h2><button type="button" onClick={onClose} className="icon-button" aria-label={`Close ${title}`}><X size={18} /></button></div>
        {children}
      </section>
    </div>
  );
}

function SettingsModal({ user, onUpdateUser, theme, onToggleTheme, onClose, onLogout }) {
  const [email, setEmail] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);
  const save = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    const updated = { ...user, email: email.trim(), displayName: email.trim().split('@')[0] };
    onUpdateUser?.(updated);
    try { localStorage.setItem('rag_chat_user', JSON.stringify(updated)); } catch { /* Optional. */ }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };
  return (
    <Modal title="Workspace settings" onClose={onClose}>
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
        <div><h3 className="text-sm font-semibold">Appearance</h3><p className="mt-1 text-xs text-[var(--text-muted)]">Currently using {theme} mode</p></div>
        <button type="button" onClick={onToggleTheme} className="secondary-button !min-h-[40px] !px-3">{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}{theme === 'dark' ? 'Light' : 'Dark'}</button>
      </div>
      <form onSubmit={save} className="mt-5">
        <label htmlFor="account-email" className="text-sm font-semibold">Account email</label>
        <input id="account-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)]" />
        <button type="submit" className="primary-button mt-3 w-full">{saved ? <><Check size={16} />Saved</> : 'Save changes'}</button>
      </form>
      {onLogout && <button type="button" onClick={() => { onClose(); onLogout(); }} className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg text-sm text-[var(--danger)] transition-colors hover:bg-[var(--danger-soft)]"><LogOut size={15} />Log out</button>}
    </Modal>
  );
}
