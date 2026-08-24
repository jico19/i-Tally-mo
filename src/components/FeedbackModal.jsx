import React, { useState } from 'react';
import { MessageSquarePlus, X, Sparkles, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function FeedbackModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [category, setCategory] = useState('Feature Request');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'Feature Request', label: '✨ Feature', desc: 'New tally tools, charts or sharing' },
    { id: 'UX & Usability', label: '⚡ Speed / UX', desc: 'Smoother taps, layout, animation' },
    { id: 'Bug Report', label: '🐛 Bug / Glitch', desc: 'Something not working as expected' },
    { id: 'General Idea', label: '💡 Idea', desc: 'Any other suggestion or thought' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please write a brief description of your suggestion.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (user && isSupabaseConfigured) {
        // Try inserting into Supabase tally_feedback
        const { error: insertErr } = await supabase
          .from('tally_feedback')
          .insert([
            {
              user_id: user.id,
              category: category,
              message: message.trim()
            }
          ]);

        if (insertErr) {
          console.warn('Feedback table not configured in Supabase yet, saved locally:', insertErr.message);
          // Fallback to local storage
          const existing = JSON.parse(localStorage.getItem('tally_feedback') || '[]');
          existing.push({
            category,
            message: message.trim(),
            date: new Date().toISOString()
          });
          localStorage.setItem('tally_feedback', JSON.stringify(existing));
        }
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setMessage('');
        onClose();
      }, 1600);
    } catch (err) {
      setError(err.message || 'Failed to send suggestion');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center modal-backdrop p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">Suggest Improvements</h3>
              <p className="text-xs text-slate-500">Help shape future updates for TallyBoard</p>
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

        {/* Success State */}
        {isSuccess ? (
          <div className="py-10 text-center space-y-3 animate-slide-up">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Thank you!</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your feedback and suggestions have been received. We review user ideas regularly!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-2xl border border-rose-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Feedback Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all btn-spring ${
                      category === cat.id
                        ? 'bg-indigo-50/90 border-indigo-300 text-indigo-900 ring-1 ring-indigo-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold">{cat.label}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{cat.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestion Textarea */}
            <div>
              <label htmlFor="feedback-message" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Your Idea or Improvement
              </label>
              <textarea
                id="feedback-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your feature idea, UX tweak, or workflow suggestion..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm transition-all shadow-xs resize-none"
              />
            </div>

            {/* Actions */}
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
                disabled={submitting || !message.trim()}
                className="flex-1 py-3 text-sm font-bold text-white bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 active:from-indigo-700 active:to-indigo-800 disabled:opacity-50 rounded-2xl transition-all shadow-md shadow-indigo-200/80 flex items-center justify-center gap-2 btn-spring min-h-[46px]"
              >
                {submitting ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Idea</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
