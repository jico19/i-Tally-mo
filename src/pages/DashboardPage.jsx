import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoards } from '../hooks/useBoards';
import { useAuth } from '../contexts/AuthContext';
import BoardCard from '../components/BoardCard';
import AddBoardForm from '../components/AddBoardForm';
import SuggestionPresets from '../components/SuggestionPresets';
import FeedbackModal from '../components/FeedbackModal';
import { Plus, Search, Sparkles, RefreshCw, AlertCircle, X, Hash, TrendingUp, Compass, MessageSquarePlus } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { boards, loading, error, refresh, createBoard, deleteBoard } = useBoards();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'highest' | 'title'
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);

  const filteredBoards = useMemo(() => {
    let result = [...boards];
    if (searchQuery.trim()) {
      result = result.filter((b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'highest') {
      result.sort((a, b) => (Number(b.total) || 0) - (Number(a.total) || 0));
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [boards, searchQuery, sortBy]);

  const grandTotal = useMemo(() => {
    return boards.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
  }, [boards]);

  const handleSelectPreset = async (preset) => {
    try {
      setIsCreatingTemplate(true);
      const newBoard = await createBoard({
        title: preset.title,
        allow_negative: false,
        initialBranches: preset.branches
      });
      if (newBoard?.id) {
        navigate(`/board/${newBoard.id}`);
      }
    } catch (err) {
      console.error('Failed to create board from preset:', err);
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-safe">
      {/* Top Header */}
      <header className="sticky top-0 z-30 glass-header border-b border-slate-200/80 px-4 py-3 sm:px-6 pt-safe">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <Hash className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                TallyBoard
              </h1>
              <p className="text-[11px] text-slate-500 truncate max-w-[170px] sm:max-w-xs mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refresh}
              aria-label="Refresh boards"
              className="p-2.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center btn-spring"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 active:from-indigo-700 active:to-indigo-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-200/80 btn-spring min-h-[44px]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Board</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2 animate-slide-up">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Grand Total Summary Hero Card */}
        {boards.length > 0 && (
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl ring-1 ring-white/10 animate-slide-up">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-200">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Aggregate Total
                </div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight mt-1 tabular-nums">
                  {grandTotal.toLocaleString()}
                </div>
                <div className="text-xs text-indigo-100/90 mt-1 flex items-center gap-2">
                  <span>{boards.length} {boards.length === 1 ? 'board' : 'boards'}</span>
                  <span>•</span>
                  <span>{boards.reduce((s, b) => s + (b.branchCount || 0), 0)} total options</span>
                </div>
              </div>

              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-xs border border-white/20">
                <Sparkles className="w-6 h-6 text-indigo-100" />
              </div>
            </div>
          </div>
        )}

        {/* Templates Banner Toggle */}
        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50/80 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl border border-indigo-100 btn-spring"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{showSuggestions ? 'Hide Template Ideas' : 'Explore Suggested Templates'}</span>
          </button>
        </div>

        {/* Suggested Templates Section */}
        {showSuggestions && (
          <div className="animate-slide-up">
            <SuggestionPresets
              onSelectPreset={handleSelectPreset}
              isCreating={isCreatingTemplate}
            />
          </div>
        )}

        {/* Search Bar & Sort Controls */}
        {boards.length >= 2 && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search boards..."
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs min-h-[44px] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {boards.length >= 3 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-medium pl-1 text-[11px]">Sort:</span>
                {[
                  { id: 'recent', label: 'Recent' },
                  { id: 'highest', label: 'Highest count' },
                  { id: 'title', label: 'Name' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSortBy(tab.id)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      sortBy === tab.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Boards List */}
        {loading && boards.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-3" />
            <p className="text-sm">Loading your tally boards...</p>
          </div>
        ) : filteredBoards.length > 0 ? (
          <div className="space-y-3 animate-slide-up">
            {filteredBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onDelete={deleteBoard}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4 animate-slide-up">
            <div className="text-center py-10 px-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                <Plus className="w-7 h-7 stroke-[2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {searchQuery ? 'No matching boards' : 'No tally boards yet'}
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                {searchQuery
                  ? `No boards matched "${searchQuery}"`
                  : 'Start by creating a custom board or pick one of the suggestions below.'}
              </p>
              {!searchQuery && (
                <button
                  type="button"
                  onClick={() => setIsAddOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-indigo-200/80 btn-spring min-h-[44px]"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Create Custom Board</span>
                </button>
              )}
            </div>

            {/* If empty, show suggestions prominently */}
            {!searchQuery && (
              <SuggestionPresets
                onSelectPreset={handleSelectPreset}
                isCreating={isCreatingTemplate}
              />
            )}
          </div>
        )}

        {/* Suggest Improvements Callout Banner */}
        {boards.length > 0 && (
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
        )}
      </main>

      {/* Add Board Modal */}
      <AddBoardForm
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={createBoard}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />
    </div>
  );
}
