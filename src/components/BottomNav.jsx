import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, BarChart3, LogOut, MessageSquarePlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import FeedbackModal from './FeedbackModal';

export default function BottomNav() {
  const { user, signOut } = useAuth();
  const [showConfirmSignOut, setShowConfirmSignOut] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!user) return null;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-slate-200/80 px-3 sm:px-4 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-around">
          {/* Boards Tab */}
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all min-h-[44px] min-w-[50px] btn-spring ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50/90 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`
            }
          >
            <LayoutGrid className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Boards</span>
          </NavLink>

          {/* Summary Tab */}
          <NavLink
            to="/summary"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all min-h-[44px] min-w-[50px] btn-spring ${
                isActive
                  ? 'text-indigo-600 bg-indigo-50/90 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`
            }
          >
            <BarChart3 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Summary</span>
          </NavLink>

          {/* Feedback / Suggestions Tab */}
          <button
            type="button"
            onClick={() => setShowFeedback(true)}
            aria-label="Suggest improvements"
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-slate-500 hover:text-indigo-600 font-medium transition-all min-h-[44px] min-w-[50px] btn-spring"
          >
            <MessageSquarePlus className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Suggest</span>
          </button>

          {/* User / Sign Out */}
          <button
            type="button"
            onClick={() => setShowConfirmSignOut(true)}
            aria-label="Sign out"
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-slate-500 hover:text-rose-600 font-medium transition-all min-h-[44px] min-w-[50px] btn-spring"
          >
            <LogOut className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] sm:text-[11px] leading-tight">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Suggest Improvements Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
      />

      {/* Sign Out Confirmation Modal */}
      {showConfirmSignOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 animate-slide-up">
            <div className="w-11 h-11 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-3">
              <LogOut className="w-5 h-5" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Sign Out?</h4>
            <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
              Are you sure you want to sign out of <span className="font-semibold text-slate-900">{user.email}</span>?
            </p>
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setShowConfirmSignOut(false)}
                className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmSignOut(false);
                  signOut();
                }}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl transition-all shadow-md shadow-rose-200 min-h-[44px]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
