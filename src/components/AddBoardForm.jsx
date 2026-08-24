import React, { useState } from 'react';
import { X, PlusCircle, Sparkles, SlidersHorizontal } from 'lucide-react';

export default function AddBoardForm({ isOpen, onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [allowNegative, setAllowNegative] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please enter a question or board title');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      await onAdd({ title: title.trim(), allow_negative: allowNegative });
      setTitle('');
      setAllowNegative(false);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to create board');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[88vh] overflow-y-auto animate-slide-up">
        {/* Modal Handle for Mobile */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">New Tally Board</h3>
              <p className="text-xs text-slate-500">Track questions, surveys or counts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors btn-spring"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {formError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="board-title" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Board Question or Title
            </label>
            <input
              id="board-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Age Demography, Coffee vs Tea, Customer Feedback"
              autoFocus
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-base min-h-[46px] transition-all shadow-xs"
            />

            {/* Quick Title Suggestion Chips */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Suggestions:</span>
              {[
                { label: 'Demography', branches: ['18–25', '26–40', '41–60', '60+'] },
                { label: 'Event Check-in', branches: ['General', 'VIP', 'Staff'] },
                { label: 'Satisfaction', branches: ['Good', 'Neutral', 'Poor'] },
                { label: 'Yes / No Poll', branches: ['Yes', 'No', 'Abstain'] }
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    setTitle(s.label);
                  }}
                  className="text-[11px] font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 px-2 py-0.5 rounded-lg transition-colors"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100">
            <div>
              <div className="text-sm font-bold text-slate-800">Allow Negative Counts</div>
              <div className="text-xs text-slate-500 mt-0.5">Let counters drop below 0 (default: 0 floor)</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allowNegative}
                onChange={(e) => setAllowNegative(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors min-h-[46px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 rounded-2xl transition-all shadow-md shadow-indigo-200 min-h-[46px] btn-spring"
            >
              {submitting ? 'Creating...' : 'Create Board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
