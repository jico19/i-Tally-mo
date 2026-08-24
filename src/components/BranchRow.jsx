import React, { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, Hash } from 'lucide-react';

export default function BranchRow({
  branch,
  allowNegative = false,
  totalBoardCount = 0,
  onIncrement,
  onDecrement,
  onDelete
}) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isBumping, setIsBumping] = useState(false);
  const count = Number(branch.count) || 0;
  const isMinusDisabled = !allowNegative && count <= 0;

  useEffect(() => {
    setIsBumping(true);
    const timer = setTimeout(() => setIsBumping(false), 200);
    return () => clearTimeout(timer);
  }, [count]);

  const handleIncrement = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(12);
    }
    onIncrement(branch.id);
  };

  const handleDecrement = () => {
    if (isMinusDisabled) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }
    onDecrement(branch.id);
  };

  const percentage = totalBoardCount > 0
    ? Math.round((Math.max(0, count) / totalBoardCount) * 100)
    : 0;

  return (
    <div className="bg-white/95 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between gap-3">
        {/* Left info */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-baseline gap-2">
            <h4 className="text-base sm:text-lg font-bold text-slate-800 break-words line-clamp-2 leading-snug">
              {branch.label}
            </h4>
          </div>
          
          <div className="flex items-center gap-3 mt-1.5">
            {totalBoardCount > 0 && (
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50/80 px-2 py-0.5 rounded-full border border-indigo-100">
                {percentage}% share
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-rose-600 transition-colors py-0.5"
              aria-label={`Delete branch ${branch.label}`}
            >
              <Trash2 className="w-3 h-3" />
              Remove
            </button>
          </div>
        </div>

        {/* Tactile Counter Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Decrement Button */}
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isMinusDisabled}
            aria-label={`Decrease ${branch.label}`}
            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center font-bold text-lg btn-spring select-none ${
              isMinusDisabled
                ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200/40 opacity-60'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 border border-slate-200/90 shadow-xs'
            }`}
          >
            <Minus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>

          {/* Counter Display with Spring Bump */}
          <div className="min-w-[3.25rem] sm:min-w-[4rem] text-center px-1">
            <span
              className={`inline-block text-2xl sm:text-3xl font-black text-slate-900 tabular-nums tracking-tight transition-transform duration-150 ${
                isBumping ? 'scale-115 text-indigo-600' : 'scale-100'
              }`}
            >
              {count.toLocaleString()}
            </span>
          </div>

          {/* Increment Button */}
          <button
            type="button"
            onClick={handleIncrement}
            aria-label={`Increase ${branch.label}`}
            className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center font-bold text-lg bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 active:from-indigo-700 active:to-indigo-800 text-white shadow-md shadow-indigo-200/80 ring-1 ring-white/20 btn-spring select-none"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Mini percentage progress bar if board has count */}
      {totalBoardCount > 0 && (
        <div className="mt-3 w-full bg-slate-100 rounded-full h-1 overflow-hidden">
          <div
            className="bg-indigo-500 h-1 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 animate-slide-up">
            <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Remove Option?</h4>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Remove <span className="font-semibold text-slate-900">"{branch.label}"</span> with current tally count of <span className="font-bold text-indigo-600">{count}</span>?
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(branch.id);
                  setShowConfirmDelete(false);
                }}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-all shadow-sm shadow-rose-200 min-h-[44px]"
              >
                Remove Option
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
