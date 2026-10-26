import { FileText, Loader2 } from 'lucide-react';

export default function LoadingScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--workspace)] text-[var(--text)]">
      <div className="text-center" role="status">
        <FileText size={28} strokeWidth={1.6} className="mx-auto text-[var(--accent)]" />
        <p className="mt-4 text-lg font-semibold tracking-[-0.02em]">DocAnalyzer</p>
        <p className="mt-1 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]"><Loader2 size={14} className="animate-spin" />Opening your workspace…</p>
      </div>
    </main>
  );
}
