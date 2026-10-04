import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { isFirebaseConfigured } from '../firebase';

export default function AuthScreen({
  mode,
  form,
  setForm,
  authError,
  isSubmitting,
  onSubmit,
  onGoogleSignIn,
  toggleMode,
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200/90 bg-white p-6 shadow-2xl shadow-zinc-950/5 sm:p-8">
        <div className="flex items-center gap-3.5">
          <img src="/logo.svg" alt="PDF Chat AI Logo" className="h-11 w-11 rounded-2xl shadow-xs" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-violet-600">
              AI Document Intelligence
            </p>
            <h1 className="font-['Manrope'] text-xl font-extrabold tracking-tight text-zinc-900">
              PDF Chat AI
            </h1>
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-zinc-500">
          {mode === 'login'
            ? 'Sign in to access your saved document chats and analysis.'
            : 'Create your account to start chatting with PDFs.'}
        </p>

        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <div className="flex h-12 items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 transition focus-within:border-violet-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-500/10">
            <Mail size={16} className="text-zinc-400" />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
            />
          </div>

          <div className="flex h-12 items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 transition focus-within:border-violet-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-violet-500/10">
            <Lock size={16} className="text-zinc-400" />
            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              minLength={6}
              required
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
            />
          </div>

          {authError && (
            <div className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600">
              <AlertCircle size={15} className="shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {!isFirebaseConfigured && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
              Add your Firebase project values in frontend/.env to enable sign-in.
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isFirebaseConfigured}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 text-xs font-bold text-white shadow-sm transition hover:bg-violet-600 hover:shadow-violet-600/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Please wait...
              </>
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="text-[10px] font-bold text-zinc-400">OR</span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>

          <button
            type="button"
            onClick={onGoogleSignIn}
            disabled={!isFirebaseConfigured || isSubmitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 shadow-2xs transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
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
        </form>

        <div className="mt-6 border-t border-zinc-100 pt-5 text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs text-zinc-500 transition hover:text-zinc-800"
          >
            {mode === 'login' ? (
              <>
                Don&apos;t have an account? <strong className="text-violet-600 font-bold">Sign up</strong>
              </>
            ) : (
              <>
                Already have an account? <strong className="text-violet-600 font-bold">Sign in</strong>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
