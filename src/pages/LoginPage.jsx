import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Hash, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, authError, isConfigured } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setLocalError('');
      await signInWithGoogle();
    } catch (err) {
      setLocalError(err.message || 'Failed to initiate Google sign in');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 p-6 sm:p-8">
      <div className="max-w-sm mx-auto w-full pt-10 sm:pt-16 text-center animate-slide-up">
        {/* Brand Icon */}
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-200/80 mb-6 ring-1 ring-white/30">
          <Hash className="w-8 h-8 stroke-[2.5]" />
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full animate-pulse-glow" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          i-Tally mo!
        </h1>
        <p className="mt-2.5 text-slate-600 text-sm sm:text-base leading-relaxed max-w-xs mx-auto">
          Fast, thumb-friendly tally counters for surveys, demography, and live audits.
        </p>

        {/* Feature Highlights */}
        <div className="mt-7 space-y-2.5 text-left bg-white/90 p-4 rounded-3xl border border-slate-200/80 shadow-xs backdrop-blur-xs">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-semibold">
            <span className="flex items-center justify-center w-6 h-6 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <Zap className="w-3.5 h-3.5" />
            </span>
            Optimistic, zero-lag thumb counters
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-semibold">
            <span className="flex items-center justify-center w-6 h-6 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
            Automatic live totals & multi-device sync
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-700 font-semibold">
            <span className="flex items-center justify-center w-6 h-6 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            Aggregated cross-board summaries
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto w-full pb-8 space-y-3.5 animate-slide-up">
        {!isConfigured && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex gap-2.5 shadow-xs">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Supabase Config Needed</p>
              <p className="mt-1 text-amber-800">
                Please set <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_SUPABASE_ANON_KEY</code> in your environment.
              </p>
            </div>
          </div>
        )}

        {(authError || localError) && (
          <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-700 text-xs shadow-xs animate-slide-up">
            {authError || localError}
          </div>
        )}

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading || !isConfigured}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 text-slate-800 font-bold text-sm sm:text-base rounded-2xl border border-slate-300/90 shadow-sm btn-spring min-h-[50px]"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
          {loading ? 'Connecting...' : 'Sign in with Google'}
        </button>

        <p className="text-center text-[11px] text-slate-400">
          Develop by J.N Quijano
        </p>
      </div>
    </div>
  );
}
