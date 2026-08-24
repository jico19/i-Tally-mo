import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBranches } from '../hooks/useBranches';
import { useTallyActions } from '../hooks/useTallyActions';
import BranchRow from '../components/BranchRow';
import AddBranchForm from '../components/AddBranchForm';
import TotalBadge from '../components/TotalBadge';
import { ArrowLeft, RefreshCw, AlertCircle, Sparkles, Plus, Activity } from 'lucide-react';

export default function BoardDetailPage() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const {
    board,
    branches,
    setBranches,
    totalCount,
    loading,
    error,
    refresh,
    addBranch,
    deleteBranch
  } = useBranches(boardId);

  const { increment, decrement, syncError } = useTallyActions(
    setBranches,
    board?.allow_negative
  );

  const commonSuggestions = [
    ['Yes', 'No', 'Maybe'],
    ['18–25', '26–40', '41–60', '60+'],
    ['Satisfied', 'Neutral', 'Unsatisfied']
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-header border-b border-slate-200/80 px-4 py-3 sm:px-6 pt-safe">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              to="/"
              aria-label="Back to boards"
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center btn-spring"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 truncate">
                {board?.title || 'Loading board...'}
              </h1>
              {board?.allow_negative && (
                <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded mt-0.5">
                  Negative counts enabled
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              aria-label="Refresh board"
              className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center btn-spring"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Error Banners */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2 animate-slide-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {syncError && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl flex items-center gap-2 animate-slide-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{syncError}</span>
          </div>
        )}

        {/* Live Running Total Hero Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl ring-1 ring-white/10">
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300">
                <Activity className="w-3.5 h-3.5" />
                Live Board Total
              </div>
              <div className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-1.5 tabular-nums">
                {totalCount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-300 mt-1.5 flex items-center gap-2">
                <span>{branches.length} {branches.length === 1 ? 'option' : 'options'} active</span>
              </div>
            </div>

            <TotalBadge count={totalCount} size="lg" variant="dark" />
          </div>
        </div>

        {/* Add Branch Input */}
        <div className="pt-1">
          <AddBranchForm onAdd={addBranch} />
        </div>

        {/* Branches Counter List */}
        {loading && branches.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
            <p className="text-sm">Loading options...</p>
          </div>
        ) : branches.length > 0 ? (
          <div className="space-y-2.5 animate-slide-up">
            {branches.map((branch) => (
              <BranchRow
                key={branch.id}
                branch={branch}
                totalBoardCount={totalCount}
                allowNegative={board?.allow_negative}
                onIncrement={increment}
                onDecrement={decrement}
                onDelete={deleteBranch}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-5 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <p className="text-base font-bold text-slate-800">No options added yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Add sub-questions or options using the input above or pick a starter preset:
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {['Yes', 'No', 'Option A', 'Option B'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => addBranch({ label: preset })}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors text-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
