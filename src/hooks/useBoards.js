import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export function useBoards() {
  const { user } = useAuth();
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoards = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setBoards([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      // Fetch boards with their branches to calculate totals
      const { data, error: fetchErr } = await supabase
        .from('tally_boards')
        .select(`
          *,
          tally_branches (
            id,
            count
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      const formatted = (data || []).map((board) => {
        const total = (board.tally_branches || []).reduce(
          (sum, br) => sum + (Number(br.count) || 0),
          0
        );
        const branchCount = (board.tally_branches || []).length;
        return {
          ...board,
          total,
          branchCount
        };
      });

      setBoards(formatted);
    } catch (err) {
      setError(err.message || 'Failed to fetch boards');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBoards();

    if (!user || !isSupabaseConfigured) return;

    // Realtime channel for boards and branches
    const channel = supabase
      .channel('boards-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tally_boards' },
        () => fetchBoards()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tally_branches' },
        () => fetchBoards()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchBoards]);

  const createBoard = async ({ title, allow_negative = false, initialBranches = [] }) => {
    if (!user) throw new Error('You must be signed in to create a board.');
    setError(null);
    try {
      const { data, error: insertErr } = await supabase
        .from('tally_boards')
        .insert([
          {
            user_id: user.id,
            title: title.trim(),
            allow_negative: Boolean(allow_negative)
          }
        ])
        .select()
        .single();

      if (insertErr) throw insertErr;

      if (Array.isArray(initialBranches) && initialBranches.length > 0) {
        const branchRows = initialBranches.map((label, index) => ({
          board_id: data.id,
          label: typeof label === 'string' ? label.trim() : label.label,
          count: 0,
          position: index
        }));

        const { error: branchErr } = await supabase
          .from('tally_branches')
          .insert(branchRows);

        if (branchErr) console.warn('Failed to insert initial template branches:', branchErr);
      }

      await fetchBoards();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteBoard = async (boardId) => {
    setError(null);
    try {
      const { error: delErr } = await supabase
        .from('tally_boards')
        .delete()
        .eq('id', boardId);

      if (delErr) throw delErr;
      setBoards((prev) => prev.filter((b) => b.id !== boardId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    boards,
    loading,
    error,
    refresh: fetchBoards,
    createBoard,
    deleteBoard
  };
}
