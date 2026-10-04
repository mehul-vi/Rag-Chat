import { Send, Loader2 } from 'lucide-react';

const MAX_QUESTION_LENGTH = 1000;

export default function ChatInput({
  inputValue,
  onChangeInput,
  onSubmit,
  isUploading,
  isTyping,
  canChat,
  documentId,
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="mx-auto flex w-full max-w-4xl items-end gap-2 px-4 pb-4 pt-2 sm:px-8"
    >
      <div className="relative min-w-0 flex-1">
        <input
          type="text"
          value={inputValue}
          maxLength={MAX_QUESTION_LENGTH}
          onChange={(e) => onChangeInput(e.target.value)}
          disabled={!canChat}
          placeholder={
            isUploading
              ? 'Processing PDF document, please wait...'
              : documentId
              ? 'Ask a question about your PDF...'
              : 'Upload a PDF to start asking questions...'
          }
          className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 text-sm text-zinc-900 shadow-2xs outline-none transition placeholder:text-zinc-400 focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-500/10 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={!canChat || !inputValue.trim()}
        title="Send question (Enter)"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-md transition hover:bg-violet-600 hover:shadow-violet-600/25 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
      </button>
    </form>
  );
}
