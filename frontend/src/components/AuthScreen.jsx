
import {
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  FileText,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';

export default function AuthScreen({
  mode,
  form,
  setForm,
  authError,
  isSubmitting,
  onSubmit,
  onGoogleSignIn,
  onGuestLogin,
  toggleMode,
  theme,
  onToggleTheme,
}) {
  const isDark = theme === 'dark';
  const isLogin = mode === 'login';

  const inputClass = `
    h-12 w-full rounded-xl border border-stone-200/90
    bg-stone-50/70 pl-10 pr-3
    text-sm text-stone-900 outline-none
    placeholder:text-stone-400
    transition-all duration-200
    focus:border-[#a54840]/50
    focus:bg-white focus:ring-2 focus:ring-[#a54840]/10
    dark:border-zinc-800 dark:bg-zinc-900/70
    dark:text-zinc-100 dark:placeholder:text-zinc-500
    dark:focus:border-[#c16b62]/50 dark:focus:bg-zinc-900
  `;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#faf9f6] px-4 py-12 transition-colors duration-300 dark:bg-[#09090b]">
      {/* Theme toggle */}
      {onToggleTheme && (
        <button
          type="button"
          onClick={onToggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200/80 bg-white/80 text-stone-600 transition hover:border-[#a54840]/30 hover:text-[#a54840] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a54840]/40 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-[#e2a099]"
        >
          {isDark ? (
            <Sun size={16} className="text-amber-400" />
          ) : (
            <Moon size={16} />
          )}
        </button>
      )}

      {/* Auth card */}
      <section className="w-full max-w-[410px] rounded-3xl border border-stone-200/80 bg-[#fffdfa] p-6 shadow-xl shadow-stone-900/[0.04] transition-colors duration-300 sm:p-9 dark:border-zinc-800 dark:bg-[#111114] dark:shadow-black/30">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#a54840] text-white shadow-sm">
            <FileText size={21} strokeWidth={1.7} />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-stone-900 dark:text-zinc-100">
              PDF Chat RAG
            </h1>

            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#a54840] dark:text-[#d58b83]">
              Document intelligence
            </p>
          </div>
        </div>

        {/* Heading */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-zinc-100">
            {isLogin ? 'Welcome back.' : 'Create your account.'}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-zinc-400">
            {isLogin
              ? 'Sign in to access your documents and conversation history.'
              : 'Get started with your personal document assistant.'}
          </p>
        </div>

        {/* Email and password form */}
        <form className="mt-7 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <label
              htmlFor="auth-email"
              className="text-xs font-medium text-stone-700 dark:text-zinc-300"
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500"
              />

              <input
                id="auth-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                required
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="auth-password"
              className="text-xs font-medium text-stone-700 dark:text-zinc-300"
            >
              Password
            </label>

            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-zinc-500"
              />

              <input
                id="auth-password"
                type="password"
                name="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                minLength={6}
                required
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>
          </div>

          {/* Authentication error */}
          {authError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-200/70 bg-red-50/70 p-3 text-xs leading-relaxed text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#a54840] px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#8f3c35] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a54840]/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-[#111114]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Please wait...
              </>
            ) : (
              <>
                {isLogin ? 'Sign in' : 'Create account'}
                <ArrowRight
                  size={15}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center">
          <div className="flex-1 border-t border-stone-200 dark:border-zinc-800" />
          <span className="px-3 text-[10px] font-medium uppercase tracking-[0.12em] text-stone-400 dark:text-zinc-500">
            Or continue with
          </span>
          <div className="flex-1 border-t border-stone-200 dark:border-zinc-800" />
        </div>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={onGoogleSignIn}
          disabled={isSubmitting}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-stone-200/90 bg-white text-sm font-medium text-stone-700 transition-all duration-200 hover:border-stone-300 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a54840]/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
        >
          <svg
            aria-hidden="true"
            className="h-[17px] w-[17px] shrink-0"
            viewBox="0 0 24 24"
          >
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

          Continue with Google
        </button>

        {/* Continue as Guest */}
        {onGuestLogin && (
          <button
            type="button"
            onClick={onGuestLogin}
            disabled={isSubmitting}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 bg-transparent text-xs font-semibold text-stone-600 transition-all duration-200 hover:border-stone-400 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a54840]/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/60"
          >
            Continue as Guest / Preview
          </button>
        )}

        {/* Switch auth mode */}
        <p className="mt-7 text-center text-xs text-stone-500 dark:text-zinc-400">
          {isLogin
            ? "Don't have an account? "
            : 'Already have an account? '}

          <button
            type="button"
            onClick={toggleMode}
            className="font-semibold text-[#a54840] underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a54840]/40 dark:text-[#d58b83]"
          >
            {isLogin ? 'Create one' : 'Sign in'}
          </button>
        </p>

        <p className="mt-6 text-center text-[10px] leading-relaxed text-stone-400 dark:text-zinc-600">
          Your documents and conversations stay within your account.
        </p>
      </section>
    </main>
  );
}
