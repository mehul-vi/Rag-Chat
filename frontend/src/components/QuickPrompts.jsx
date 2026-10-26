
import { Sparkles, ArrowUpRight } from 'lucide-react';

export default function QuickPrompts({ prompts, onSelectPrompt }) {
  if (!prompts || prompts.length === 0) return null;

  return (
    <div className="mx-auto flex w-full max-w-5xl items-center gap-3 overflow-hidden px-4 pb-3 sm:px-8">
      {/* Section label */}
      <div className="hidden shrink-0 items-center gap-2 sm:flex">
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#167d91]/15 bg-[#eaf6f7] dark:border-[#167d91]/30 dark:bg-[#167d91]/15">
          <Sparkles
            size={13}
            className="text-[#167d91] dark:text-[#71c7d5]"
          />
        </span>

        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          Try asking
        </span>
      </div>

      {/* Horizontally scrollable prompts */}
      <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {prompts.map((prompt, idx) => (
          <button
            type="button"
            key={`${prompt}-${idx}`}
            onClick={() => onSelectPrompt(prompt)}
            className="
              group flex shrink-0 items-center gap-2
              rounded-full border border-slate-200
              bg-white px-3.5 py-2.5
              text-xs font-medium text-slate-600
              transition-all duration-200
              hover:border-[#167d91]/40
              hover:bg-[#eaf6f7]/70
              hover:text-[#126b7b]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#167d91]/40
              active:scale-[0.98]
              dark:border-slate-700
              dark:bg-slate-900
              dark:text-slate-300
              dark:hover:border-[#167d91]/50
              dark:hover:bg-[#167d91]/10
              dark:hover:text-[#8bd8e3]
            "
          >
            <span>{prompt}</span>

            <ArrowUpRight
              size={13}
              className="
                shrink-0 text-slate-400
                transition-all duration-200
                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
                group-hover:text-[#167d91]
                dark:text-slate-500
                dark:group-hover:text-[#71c7d5]
              "
            />
          </button>
        ))}
      </div>
    </div>
  );
}
