import { ArrowUp, Loader2, FileText } from 'lucide-react';

const MAX_QUESTION_LENGTH = 1000;

export default function ChatInput({
  inputValue,
  onChangeInput,
  onSubmit,
  isUploading,
  isTyping,
  canChat,
  documentId,
  fileName,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="mx-auto flex w-full max-w-4xl flex-col gap-1.5 px-4 pb-4 pt-2 sm:px-8"
    >
      <div className="relative flex items-center rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/90 dark:focus-within:border-indigo-500/40 dark:focus-within:ring-indigo-500/10">
        {/* Document Indicator Chip */}
        {documentId && (
          <div className="ml-3 hidden max-w-[150px] items-center gap-1.5 truncate rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 sm:flex dark:border-zinc-800 dark:bg-zinc-800/80 dark:text-zinc-300">
            <FileText size={12} className="shrink-0 text-indigo-500" />
            <span className="truncate">{fileName || 'Document'}</span>
          </div>
        )}

        {/* Input */}
        <input
          type="text"
          value={inputValue}
          maxLength={MAX_QUESTION_LENGTH}
          onChange={(e) => onChangeInput(e.target.value)}
          disabled={!canChat}
          placeholder={
            isUploading
              ? 'Processing document embeddings, please wait...'
              : documentId
              ? 'Ask anything about this document...'
              : 'Upload a PDF above to start querying...'
          }
          className="h-12 w-full bg-transparent px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />

        {/* Send Button */}
        <div className="mr-2 flex items-center gap-1.5">
          <button
            type="submit"
            disabled={!canChat || !inputValue.trim()}
            title="Send query (Enter)"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-xs transition hover:bg-indigo-600 hover:shadow-indigo-600/25 disabled:cursor-not-allowed disabled:opacity-30 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-indigo-500 dark:hover:text-white"
          >
            {isTyping ? <Loader2 size={15} className="animate-spin" /> : <ArrowUp size={15} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 dark:text-zinc-500">
        <span>Answers derived strictly from document text</span>
        <span className="hidden items-center gap-1 sm:inline-flex">
          <kbd className="rounded border border-slate-200 px-1 py-0.5 text-[9px] font-mono dark:border-zinc-800">Enter</kbd> to query
        </span>
      </div>
    </form>
  );
}
