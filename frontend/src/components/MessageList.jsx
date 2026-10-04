import { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, Copy, Check, FileText } from 'lucide-react';

const markdownComponents = {
  table: (props) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-zinc-200 shadow-2xs">
      <table {...props} className="min-w-full text-left text-xs text-zinc-700" />
    </div>
  ),
  th: (props) => (
    <th {...props} className="bg-zinc-50 px-3 py-2 font-bold text-zinc-900 border-b border-zinc-200" />
  ),
  td: (props) => (
    <td {...props} className="px-3 py-2 border-b border-zinc-100" />
  ),
  code: ({ inline, ...props }) => (
    inline ? (
      <code {...props} className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[12px] text-zinc-800" />
    ) : (
      <code {...props} />
    )
  ),
  pre: (props) => (
    <pre {...props} className="my-2.5 overflow-x-auto rounded-xl bg-zinc-900 p-3.5 font-mono text-[12px] text-zinc-100 shadow-sm" />
  ),
  p: (props) => <p {...props} className="mb-2.5 last:mb-0" />,
  ul: (props) => <ul {...props} className="mb-2.5 list-disc pl-5 space-y-1" />,
  ol: (props) => <ol {...props} className="mb-2.5 list-decimal pl-5 space-y-1" />,
  h1: (props) => <h1 {...props} className="mb-2 mt-4 font-['Manrope'] text-lg font-bold text-zinc-900" />,
  h2: (props) => <h2 {...props} className="mb-2 mt-3 font-['Manrope'] text-base font-bold text-zinc-900" />,
  h3: (props) => <h3 {...props} className="mb-1 mt-2.5 font-['Manrope'] text-sm font-bold text-zinc-900" />,
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
  const pages = groupSourcesByPage(sources ?? []);
  const isUser = role === 'user';

  const handleCopy = () => {
    const text = rawText || (typeof children === 'string' ? children : '');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          isUser
            ? 'bg-zinc-900 text-white shadow-xs'
            : 'border border-zinc-200 bg-white text-violet-600 shadow-xs'
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={`flex min-w-0 max-w-[88%] flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`mb-1 flex items-center gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            {isUser ? 'You' : 'PDF Assistant'}
          </span>
          {!isUser && (
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>

        <div
          className={`rounded-2xl px-4 py-3.5 text-sm leading-relaxed shadow-xs ${
            isUser
              ? 'rounded-tr-xs bg-zinc-900 text-white'
              : 'rounded-tl-xs border border-zinc-200/90 bg-white text-zinc-800'
          }`}
        >
          {children}
        </div>

        {pages.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
              Citations:
            </span>
            {pages.map((source) => (
              <span
                key={source.pageNumber}
                title={source.snippet}
                className="inline-flex items-center gap-1 rounded-lg border border-violet-100 bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-700 shadow-2xs transition hover:bg-violet-100"
              >
                <FileText size={10} className="text-violet-500" /> Page {source.pageNumber}
                <span className="text-violet-300">•</span>
                {Math.round(source.score * 100)}% match
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-violet-600 shadow-xs">
        <Bot size={16} />
      </div>
      <div className="rounded-2xl rounded-tl-xs border border-zinc-200 bg-white px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-zinc-500">AI is reading document & thinking</span>
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.2s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.1s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500" />
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
