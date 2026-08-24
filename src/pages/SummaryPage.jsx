import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useBoards } from '../hooks/useBoards';
import TotalBadge from '../components/TotalBadge';
import FeedbackModal from '../components/FeedbackModal';
import { BarChart3, ChevronRight, RefreshCw, Layers, Award, TrendingUp, Sparkles, MessageSquarePlus } from 'lucide-react';

export default function SummaryPage() {
  const { boards, loading, refresh } = useBoards();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const grandTotal = useMemo(() => {
    return boards.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
  }, [boards]);

  // Sort boards by total count for ranking
  const rankedBoards = useMemo(() => {
    return [...boards].sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0));
  }, [boards]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-safe">
      {/* Header */}
      <header className="sticky top-0 z-30 glass-header border-b border-slate-200/80 px-4 py-3 sm:px-6 pt-safe">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-2xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                Summary Report
              </h1>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Grand totals across all tally boards
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refresh}
            aria-label="Refresh summary"
            className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center btn-spring"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto p-4 sm:p-6 space-y-5">
        {/* Grand Total Hero Box */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl ring-1 ring-white/10 animate-slide-up">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300">
              <TrendingUp className="w-3.5 h-3.5" />
              Grand Total Tally
            </div>
            <div className="text-4xl sm:text-5xl font-black tracking-tight mt-1.5 tabular-nums text-white">
              {grandTotal.toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 mt-2 flex items-center gap-2">
              <span className="font-semibold text-indigo-200">{boards.length} total boards</span>
              <span>•</span>
              <span>
                {boards.reduce((sum, b) => sum + (b.branchCount || 0), 0)} total branches
              </span>
            </div>
          </div>
        </div>

        {/* Board Breakdown */}
        <div>
          <div className="flex items-center justify-between px-1 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Ranked Breakdown
            </h2>
            <span className="text-xs text-slate-400 font-medium">Sorted by highest count</span>
          </div>

          {loading && boards.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
              <p className="text-sm">Calculating summary...</p>
            </div>
          ) : rankedBoards.length > 0 ? (
            <div className="space-y-3 animate-slide-up">
              {rankedBoards.map((board, index) => {
                const total = Number(board.total) || 0;
                const percent = grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0;
                const isTop = index === 0 && total > 0;

                return (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    className={`block bg-white/95 rounded-2xl p-4 sm:p-5 border transition-all duration-200 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isTop
                        ? 'border-indigo-300/90 shadow-md ring-1 ring-indigo-500/10'
                        : 'border-slate-200/90 shadow-xs hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {/* Rank tag & Title */}
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-1">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                            index === 0
                              ? 'bg-amber-100 text-amber-800'
                              : index === 1
                              ? 'bg-slate-200 text-slate-700'
                              : index === 2
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          #{index + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {board.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Layers className="w-3 h-3 text-slate-400" />
                              {board.branchCount || 0} branches
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-indigo-600">
                              {percent}% share
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <TotalBadge count={total} size="md" />
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-all">
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-1.5 rounded-full transition-all duration-400 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs animate-slide-up">
              <p className="text-sm font-bold text-slate-800">No boards to summarize</p>
              <Link
                to="/"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                Create your first board
              </Link>
            </div>
          )}
        </div>

        {/* Suggestion Callout in Summary */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setShowFeedbackModal(true)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 bg-white/80 hover:bg-indigo-50/80 px-4 py-2.5 rounded-2xl border border-slate-200/80 hover:border-indigo-200 transition-all shadow-2xs btn-spring"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>Have an idea for TallyBoard? Suggest an improvement</span>
          </button>
        </div>
      </main>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
}
