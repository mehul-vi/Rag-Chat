import { FileText } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100/90 text-slate-700 transition-colors dark:bg-[#09090b] dark:text-zinc-300">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md animate-pulse dark:bg-zinc-100 dark:text-zinc-950">
          <FileText size={24} />
        </div>
        <p className="text-xs font-semibold tracking-wide text-slate-500 dark:text-zinc-400">Loading Document Intelligence...</p>
      </div>
    </div>
  );
}
