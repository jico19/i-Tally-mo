import React, { useState } from 'react';
import { Plus } from 'lucide-react';

export default function AddBranchForm({ onAdd }) {
  const [label, setLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!label.trim()) return;

    try {
      setSubmitting(true);
      await onAdd({ label: label.trim() });
      setLabel('');
    } catch (err) {
      console.error('Failed to add branch:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Add option (e.g. Yes, No, 18–25)..."
        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base shadow-xs min-h-[46px] transition-all"
      />
      <button
        type="submit"
        disabled={submitting || !label.trim()}
        aria-label="Add branch"
        className="w-12 h-12 sm:w-auto sm:px-5 sm:h-12 bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 active:from-indigo-700 active:to-indigo-800 disabled:opacity-50 text-white font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200/80 btn-spring shrink-0 min-h-[46px]"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span className="hidden sm:inline text-sm">Add Option</span>
      </button>
    </form>
  );
}
