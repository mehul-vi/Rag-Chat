import { Sparkles, ArrowRight } from 'lucide-react';

export default function QuickPrompts({ prompts, onSelectPrompt }) {
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="mx-auto flex w-full max-w-4xl items-center gap-2 overflow-hidden px-4 pb-2 sm:px-8">
      <div className="hidden shrink-0 items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 sm:flex">
        <Sparkles size={11} className="text-indigo-500 dark:text-indigo-400" /> Suggested
      </div>
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 scrollbar-none">
        {prompts.map((prompt, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            className="group flex shrink-0 items-center gap-2 rounded-full border border-slate-200/90 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-2xs transition-all hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-700 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <span>{prompt}</span>
            <ArrowRight
              size={11}
              className="text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-600 dark:text-zinc-500 dark:group-hover:text-indigo-400"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
