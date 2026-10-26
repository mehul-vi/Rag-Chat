import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Loader2, Lightbulb, ChevronRight, Paperclip } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Summarize this document',
  'What are the key points?',
  'Find important dates and figures',
  'Explain the main conclusions',
  'Which sections need attention?',
];

export default function ChatInput({ inputValue, onChangeInput, onSubmit, isUploading, isTyping, canChat, fileName }) {
  const [showPromptsMenu, setShowPromptsMenu] = useState(false);
  const menuRef = useRef(null);
  const textareaRef = useRef(null);
  const isBusy = isUploading || isTyping;

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 144)}px`;
  }, [inputValue]);

  useEffect(() => {
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setShowPromptsMenu(false);
    };
    const handleEscape = (event) => { if (event.key === 'Escape') setShowPromptsMenu(false); };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSubmit = (event) => {
    event?.preventDefault();
    if (!inputValue.trim() || isBusy || !canChat) return;
    onSubmit();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative w-full" ref={menuRef}>
      {showPromptsMenu && (
        <div className="modal-panel absolute bottom-full left-0 z-30 mb-3 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] p-2 shadow-[var(--shadow-soft)]" role="dialog" aria-label="Suggested prompts">
          <div className="flex items-center gap-2 px-3 py-2 text-[var(--text-muted)]"><Lightbulb size={14} className="text-[var(--accent)]" /><span className="ui-label">Suggested prompts</span></div>
          <div className="custom-scrollbar max-h-64 overflow-y-auto">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button key={prompt} type="button" onClick={() => { onChangeInput(prompt); setShowPromptsMenu(false); window.setTimeout(() => textareaRef.current?.focus(), 30); }} className="group flex min-h-[44px] w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-ink)]">
                <span>{prompt}</span><ChevronRight size={14} className="shrink-0 opacity-40 transition-transform group-hover:translate-x-0.5 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-raised)] transition-[border-color,box-shadow] duration-200 focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/10">
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputValue}
          onChange={(event) => onChangeInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isBusy || !canChat}
          placeholder={canChat ? 'Ask or search anything in this document…' : 'Upload a document to start chatting…'}
          aria-label="Message about your document"
          className="custom-scrollbar max-h-36 min-h-[54px] w-full resize-none bg-transparent px-4 pb-2 pt-4 text-base leading-6 text-[var(--text)] outline-none placeholder:text-[var(--text-muted)] disabled:cursor-not-allowed"
        />
        <div className="flex items-center justify-between gap-2 px-2.5 pb-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => setShowPromptsMenu((open) => !open)} disabled={isBusy || !canChat} aria-expanded={showPromptsMenu} className="flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-subtle)] hover:text-[var(--accent-ink)]">
              <Lightbulb size={14} /><span className="hidden min-[420px]:inline">Browse prompts</span>
            </button>
            {fileName && <span className="hidden min-w-0 items-center gap-1.5 border-l border-[var(--border)] pl-3 text-[11px] text-[var(--text-muted)] md:flex"><Paperclip size={11} /><span className="max-w-[120px] truncate">{fileName}</span></span>}
          </div>
          <button type="submit" disabled={!inputValue.trim() || isBusy || !canChat} aria-label="Send question" className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-all ${inputValue.trim() && !isBusy && canChat ? 'bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent-hover)] active:scale-95' : 'bg-[var(--surface-subtle)] text-[var(--text-muted)]'}`}>
            {isBusy ? <Loader2 size={17} className="animate-spin" /> : <ArrowUp size={18} />}
          </button>
        </div>
      </form>
      <div className="mt-2 flex items-center justify-between gap-3 px-1 text-[10px] leading-4 text-[var(--text-muted)]">
        <span>AI can make mistakes. Check important details.</span>
        <span className="hidden shrink-0 font-ui-mono sm:inline">ENTER TO SEND</span>
      </div>
    </div>
  );
}
