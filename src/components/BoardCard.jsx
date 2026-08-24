import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Trash2, Layers, AlertCircle } from 'lucide-react';
import TotalBadge from './TotalBadge';

export default function BoardCard({ board, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setIsDeleting(true);
      await onDelete(board.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className="relative bg-white/95 rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300/80 transition-all duration-200 group">
        <Link
          to={`/board/${board.id}`}
          className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 pr-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                {board.title}
              </h3>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 font-medium bg-slate-100/90 text-slate-600 px-2 py-0.5 rounded-md">
                  <Layers className="w-3 h-3 text-slate-400" />
                  {board.branchCount || 0} {board.branchCount === 1 ? 'branch' : 'branches'}
                </span>
                {board.allow_negative && (
                  <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-amber-200/80">
                    ± neg
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <TotalBadge count={board.total || 0} size="md" />
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </Link>

        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowConfirm(true);
            }}
            aria-label={`Delete ${board.title}`}
            className="text-xs font-medium text-slate-400 hover:text-rose-600 flex items-center gap-1 py-1 px-2 -mr-1 rounded-lg hover:bg-rose-50 transition-colors min-h-[32px]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 animate-slide-up">
            <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Delete Board?</h4>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{board.title}"</span>? All branches and tally counts in this board will be permanently lost.
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-all min-h-[44px] flex items-center gap-1.5 shadow-md shadow-rose-200"
              >
                {isDeleting ? 'Deleting...' : 'Delete Board'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
