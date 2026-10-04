import { Sparkles, ArrowRight } from 'lucide-react';

export default function QuickPrompts({ prompts, onSelectPrompt }) {
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="mx-auto flex w-full max-w-4xl items-center gap-2 overflow-hidden px-4 pb-2 sm:px-8">
      <div className="hidden shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-violet-600 sm:flex">
        <Sparkles size={12} /> Suggested
      </div>
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 scrollbar-none">
        {prompts.map((prompt, idx) => (
          <button
            type="button"
            key={idx}
            onClick={() => onSelectPrompt(prompt)}
            className="group flex shrink-0 items-center gap-2 rounded-full border border-zinc-200/90 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-600 shadow-2xs transition-all hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 hover:shadow-xs"
          >
            <span>{prompt}</span>
            <ArrowRight
              size={12}
              className="text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-600"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
