import { Mail, Lock, AlertCircle, Loader2, FileText, Sun, Moon } from 'lucide-react';

export default function AuthScreen({
  mode,
  form,
  setForm,
  authError,
  isSubmitting,
  onSubmit,
  onGoogleSignIn,
  toggleMode,
  theme,
  onToggleTheme,
}) {
  const isDark = theme === 'dark';

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-100/90 px-4 py-8 transition-colors dark:bg-[#09090b]">
      {/* Top right theme toggle */}
      {onToggleTheme && (
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
        </button>
      )}

      <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-7 shadow-xl shadow-slate-950/5 transition-colors sm:p-9 dark:border-zinc-800 dark:bg-[#111114] dark:shadow-black/50">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xs dark:bg-zinc-100 dark:text-zinc-950">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-zinc-100">
              PDF Chat RAG
            </h1>
            <p className="text-[10px] font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              Enterprise Document Intelligence
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-zinc-400">
          {mode === 'login'
            ? 'Sign in to access your indexed documents and session history.'
            : 'Create an account to begin analyzing documents.'}
        </p>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/80 dark:focus-within:border-indigo-500 dark:focus-within:bg-zinc-900">
            <Mail size={15} className="text-slate-400 dark:text-zinc-500" />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
              className="min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 transition focus-within:border-indigo-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/80 dark:focus-within:border-indigo-500 dark:focus-within:bg-zinc-900">
            <Lock size={15} className="text-slate-400 dark:text-zinc-500" />
            <input
              type="password"
              placeholder="Password (minimum 6 characters)"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              minLength={6}
              required
              className="min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          {authError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle size={14} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-600 hover:shadow-indigo-600/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-indigo-500 dark:hover:text-white"
          >
            {isSubmitting && <Loader2 size={15} className="animate-spin" />}
            {mode === 'login' ? 'Sign In with Email' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200/80 dark:border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            <span className="bg-white px-2 dark:bg-[#111114]">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={isSubmitting}
          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Workspace
        </button>

        <p className="mt-5 text-center text-xs text-slate-500 dark:text-zinc-400">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={toggleMode}
            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
