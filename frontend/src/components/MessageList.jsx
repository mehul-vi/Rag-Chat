import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Sparkles, Copy, Check, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const markdownComponents = {
  table: (props) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-slate-200 shadow-2xs dark:border-zinc-800">
      <table {...props} className="min-w-full text-left text-xs text-slate-700 dark:text-zinc-300" />
    </div>
  ),
  th: (props) => (
    <th {...props} className="border-b border-slate-200 bg-slate-50 px-3.5 py-2.5 font-semibold text-slate-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100" />
  ),
  td: (props) => (
    <td {...props} className="border-b border-slate-100 px-3.5 py-2.5 dark:border-zinc-800/60" />
  ),
  code: ({ inline, ...props }) => (
    inline ? (
      <code {...props} className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[12px] text-slate-800 dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-200" />
    ) : (
      <code {...props} />
    )
  ),
  pre: (props) => (
    <pre {...props} className="my-3 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-[12px] text-slate-100 shadow-md dark:border-zinc-800 dark:bg-zinc-950" />
  ),
  p: (props) => <p {...props} className="mb-3 leading-relaxed last:mb-0" />,
  ul: (props) => <ul {...props} className="mb-3 list-disc pl-5 space-y-1.5" />,
  ol: (props) => <ol {...props} className="mb-3 list-decimal pl-5 space-y-1.5" />,
  h1: (props) => <h1 {...props} className="mb-2 mt-4 text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100" />,
  h2: (props) => <h2 {...props} className="mb-2 mt-3 text-base font-bold tracking-tight text-slate-900 dark:text-zinc-100" />,
  h3: (props) => <h3 {...props} className="mb-1 mt-2.5 text-sm font-bold text-slate-900 dark:text-zinc-100" />,
  strong: (props) => <strong {...props} className="font-semibold text-slate-900 dark:text-zinc-100" />,
  blockquote: (props) => (
    <blockquote {...props} className="border-l-2 border-indigo-500 pl-3 italic text-slate-600 dark:text-zinc-400 my-2" />
  ),
};

const groupSourcesByPage = (sources) => {
  const best = new Map();
  for (const source of sources) {
    if (!best.has(source.pageNumber) || source.score > best.get(source.pageNumber).score) {
      best.set(source.pageNumber, source);
    }
  }
  return [...best.values()].sort((a, b) => a.pageNumber - b.pageNumber);
};

function MessageItem({ role, sources, children, rawText }) {
  const [copied, setCopied] = useState(false);
  const [expandedSource, setExpandedSource] = useState(null);
  const pages = groupSourcesByPage(sources ?? []);
  const isUser = role === 'user';

  const handleCopy = () => {
    const text = rawText || (typeof children === 'string' ? children : '');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
          isUser
            ? 'bg-slate-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-950'
            : 'border border-indigo-500/20 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-400'
        }`}
      >
        {isUser ? <User size={15} /> : <Sparkles size={15} />}
      </div>

      <div className={`flex min-w-0 max-w-[88%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Header line */}
        <div className={`mb-1.5 flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
            {isUser ? 'You' : 'Document Assistant'}
          </span>
          {!isUser && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
              {copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-3.5 text-sm leading-relaxed transition-colors shadow-2xs ${
            isUser
              ? 'rounded-tr-xs bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
              : 'rounded-tl-xs border border-slate-200/90 bg-white text-slate-800 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200'
          }`}
        >
          {children}
        </div>

        {/* Source Citations */}
        {pages.length > 0 && (
          <div className="mt-2.5 flex flex-col gap-1.5 w-full">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Sources:
              </span>
              {pages.map((source) => {
                const isSelected = expandedSource === source.pageNumber;
                return (
                  <button
                    type="button"
                    key={source.pageNumber}
                    onClick={() => setExpandedSource(isSelected ? null : source.pageNumber)}
                    title={source.snippet}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'border-slate-200 bg-slate-50/80 text-slate-600 hover:border-slate-300 hover:bg-slate-100 dark:border-zinc-800 dark:bg-zinc-800/60 dark:text-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <FileText size={11} className="text-indigo-500 dark:text-indigo-400" />
                    <span>Page {source.pageNumber}</span>
                    <span className="text-slate-300 dark:text-zinc-600">•</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">{Math.round(source.score * 100)}%</span>
                    {isSelected ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                );
              })}
            </div>

            {/* Expanded Source Preview Drawer */}
            {expandedSource && (
              <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-3 text-xs leading-relaxed text-slate-700 dark:border-indigo-900/40 dark:bg-zinc-900 dark:text-zinc-300 animate-fadeIn">
                <div className="mb-1 flex items-center justify-between text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  <span>Passage from Page {expandedSource}</span>
                  <button
                    type="button"
                    onClick={() => setExpandedSource(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                  >
                    Close
                  </button>
                </div>
                <p className="font-mono text-[11px] text-slate-600 dark:text-zinc-400">
                  {pages.find((p) => p.pageNumber === expandedSource)?.snippet || 'No preview snippet available.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-50 text-indigo-600 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-400">
        <Sparkles size={15} />
      </div>
      <div className="rounded-2xl rounded-tl-xs border border-slate-200/90 bg-white px-4 py-3 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900/90">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-slate-500 dark:text-zinc-400">Retrieving context & generating answer</span>
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessageList({ messages, isTyping, messagesEndRef }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:px-8">
      {messages.map((message, index) => (
        <MessageItem
          key={`${message.role}-${index}`}
          role={message.role}
          sources={message.sources}
          rawText={typeof message.content === 'string' ? message.content : ''}
        >
          {message.role === 'ai' ? (
            <div className="markdown-content">
              <Markdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                {message.content}
              </Markdown>
            </div>
          ) : (
            message.content
          )}
        </MessageItem>
      ))}

      {isTyping && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
}
