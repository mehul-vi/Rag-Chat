import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, FileText, ChevronDown, ChevronUp, ArrowUpRight, Sparkles } from 'lucide-react';
import { getUserInitial, isInteractiveQuestion, cleanQuestionText, extractTextFromReactNode } from '../utils/chatUtils';

export default function MessageList({ messages = [], isTyping, messagesEndRef, onSelectQuestion, user }) {
  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-7 pb-2 select-text">
      {messages.map((message, index) => (
        <MessageItem
          key={message.id || `${message.role}-${index}`}
          role={message.role}
          sources={message.sources}
          suggestions={message.suggestions}
          onSelectQuestion={onSelectQuestion}
          rawText={typeof message.content === 'string' ? message.content : ''}
          user={user}
        >
          {message.content}
        </MessageItem>
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageItem({ role, children, sources = [], suggestions = [], onSelectQuestion, rawText, user }) {
  const [copied, setCopied] = useState(false);
  const [expandedSource, setExpandedSource] = useState(null);
  const [imageError, setImageError] = useState(false);
  const isUser = role === 'user';

  const sourcePages = Array.isArray(sources) ? sources.filter((source) => source && source.pageNumber != null && Number.isFinite(Number(source.pageNumber))) : [];
  const uniquePages = [...new Map(sourcePages.map((source) => [String(source.pageNumber), source])).values()];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { /* Clipboard access can be unavailable. */ }
  };

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-2.5">
        <div className="max-w-[88%] rounded-xl rounded-br-sm bg-[var(--accent)] px-4 py-3 text-base leading-7 text-[var(--on-accent)] sm:max-w-[82%]">{children}</div>
        <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-raised)] text-[11px] font-bold text-[var(--accent-ink)]" title={user?.email || 'User'}>
          {!imageError && user?.photoURL ? <img src={user.photoURL} alt="Your avatar" className="h-full w-full object-cover" onError={() => setImageError(true)} /> : getUserInitial(user)}
        </div>
      </div>
    );
  }

  const markdownComponents = {
    h1: (props) => <h2 {...props} className="mb-3 mt-6 text-xl font-semibold leading-7 first:mt-0" />,
    h2: (props) => <h3 {...props} className="mb-3 mt-6 text-lg font-semibold leading-7 first:mt-0" />,
    h3: (props) => <h4 {...props} className="mb-2 mt-5 text-base font-semibold first:mt-0" />,
    p: (props) => <p {...props} className="mb-4 text-base leading-7 text-[var(--text-secondary)] last:mb-0" />,
    strong: (props) => <strong {...props} className="font-semibold text-[var(--text)]" />,
    a: (props) => <a {...props} target="_blank" rel="noreferrer" className="font-medium text-[var(--accent-ink)] underline decoration-[var(--accent)]/35 underline-offset-4 hover:decoration-[var(--accent)]" />,
    ul: (props) => <ul {...props} className="mb-4 list-disc space-y-2 pl-5 text-base leading-7 text-[var(--text-secondary)] marker:text-[var(--accent)]" />,
    ol: (props) => <ol {...props} className="mb-4 list-decimal space-y-2 pl-5 text-base leading-7 text-[var(--text-secondary)] marker:font-ui-mono marker:text-xs marker:text-[var(--accent-ink)]" />,
    li: ({ children: itemChildren, ...props }) => {
      const text = extractTextFromReactNode(itemChildren);
      const interactive = isInteractiveQuestion(text);
      return <li {...props} onClick={interactive && onSelectQuestion ? () => onSelectQuestion(cleanQuestionText(text)) : undefined} className={`pl-1 ${interactive ? 'cursor-pointer rounded-md transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-ink)]' : ''}`} title={interactive ? 'Ask this question' : undefined}>{itemChildren}</li>;
    },
    blockquote: (props) => <blockquote {...props} className="my-5 border-l-2 border-[var(--accent)] bg-[var(--accent-soft)]/55 px-4 py-3 text-[var(--text-secondary)]" />,
    table: (props) => <div className="my-5 overflow-x-auto rounded-lg border border-[var(--border)]"><table {...props} className="w-full border-collapse text-sm" /></div>,
    th: (props) => <th {...props} className="border-b border-[var(--border)] bg-[var(--surface-subtle)] px-3 py-2.5 text-left font-semibold" />,
    td: (props) => <td {...props} className="border-b border-[var(--border)] px-3 py-2.5 text-[var(--text-secondary)]" />,
    pre: (props) => <pre {...props} className="custom-scrollbar my-4 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm leading-6" />,
    code: ({ children: codeChildren, className, ...props }) => <code {...props} className={`${!className ? 'rounded bg-[var(--accent-soft)] px-1.5 py-0.5 font-ui-mono text-[0.82em] text-[var(--accent-ink)]' : ''} ${className || ''}`}>{codeChildren}</code>,
    hr: () => <hr className="my-6 border-[var(--border)]" />,
  };

  return (
    <article className="group flex w-full items-start gap-3">
      <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-ink)]"><Sparkles size={15} /></div>
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex h-8 items-center justify-between gap-3">
          <div className="flex items-center gap-2"><span className="text-xs font-semibold">DocAnalyzer</span><span className="font-ui-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">Grounded answer</span></div>
          <button type="button" onClick={handleCopy} className="icon-button !h-8 !w-8 opacity-60 focus-visible:opacity-100 group-hover:opacity-100" title="Copy answer" aria-label="Copy answer">{copied ? <Check size={14} className="text-[var(--accent)]" /> : <Copy size={14} />}</button>
        </div>

        <div className="min-w-0"><Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{typeof children === 'string' ? children : ''}</Markdown></div>

        {suggestions.length > 0 && (
          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <p className="ui-label mb-2.5 text-[var(--text-muted)]">Continue exploring</p>
            <div className="space-y-1">
              {suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => onSelectQuestion?.(suggestion)} className="group/suggestion flex min-h-[40px] w-full items-center justify-between gap-3 rounded-md px-2 py-2 text-left text-[13px] leading-5 text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent-ink)]"><span>{suggestion}</span><ArrowUpRight size={13} className="shrink-0 opacity-50 group-hover/suggestion:opacity-100" /></button>)}
            </div>
          </div>
        )}

        {uniquePages.length > 0 && (
          <div className="mt-5 border-t border-[var(--border)] pt-4">
            <div className="mb-2.5 flex items-center gap-2"><FileText size={13} className="text-[var(--accent)]" /><span className="ui-label text-[var(--text-muted)]">Sources · {uniquePages.length}</span></div>
            <div className="flex flex-wrap gap-2">
              {uniquePages.map((source) => {
                const pageKey = String(source.pageNumber);
                const expanded = expandedSource === pageKey;
                return <button key={pageKey} type="button" onClick={() => setExpandedSource(expanded ? null : pageKey)} aria-expanded={expanded} className={`flex min-h-[36px] items-center gap-2 rounded-md border px-3 text-xs font-medium transition-colors ${expanded ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent-ink)]' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent-ink)]'}`}><FileText size={12} />Page {source.pageNumber}{expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}</button>;
              })}
            </div>
            {expandedSource !== null && <SourceExcerpt source={uniquePages.find((item) => String(item.pageNumber) === expandedSource)} onClose={() => setExpandedSource(null)} />}
          </div>
        )}
      </div>
    </article>
  );
}

function SourceExcerpt({ source, onClose }) {
  return (
    <div className="modal-panel mt-3 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)] p-4">
      <div className="mb-2 flex items-center justify-between gap-3"><span className="text-xs font-semibold text-[var(--accent-ink)]">Page {source?.pageNumber} excerpt</span><button type="button" onClick={onClose} className="min-h-[32px] rounded px-2 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-raised)] hover:text-[var(--text)]">Close</button></div>
      <p className={`whitespace-pre-wrap text-sm leading-6 ${source?.snippet ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`}>{source?.snippet || 'No excerpt was provided for this citation.'}</p>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-3" role="status" aria-label="Analyzing document">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent-ink)]"><Sparkles size={15} /></div>
      <span className="text-sm text-[var(--text-muted)]">Analyzing document</span>
      <div className="flex gap-1">{[0, 1, 2].map((dot) => <span key={dot} className="typing-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />)}</div>
    </div>
  );
}
