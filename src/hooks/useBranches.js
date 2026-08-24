import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export function useBranches(boardId) {
  const [board, setBoard] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBoardAndBranches = useCallback(async () => {
    if (!boardId || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // 1. Fetch Board
      const { data: boardData, error: boardErr } = await supabase
        .from('tally_boards')
        .select('*')
        .eq('id', boardId)
        .single();

      if (boardErr) throw boardErr;
      setBoard(boardData);

      // 2. Fetch Branches
      const { data: branchesData, error: branchesErr } = await supabase
        .from('tally_branches')
        .select('*')
        .eq('board_id', boardId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });

      if (branchesErr) throw branchesErr;
      setBranches(branchesData || []);
    } catch (err) {
      setError(err.message || 'Failed to load board details');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoardAndBranches();

    if (!boardId || !isSupabaseConfigured) return;

    const channel = supabase
      .channel(`branches-${boardId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tally_branches',
          filter: `board_id=eq.${boardId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBranches((prev) => {
              if (prev.some((b) => b.id === payload.new.id)) return prev;
              return [...prev, payload.new];
            });
          } else if (payload.eventType === 'UPDATE') {
            setBranches((prev) =>
              prev.map((b) => (b.id === payload.new.id ? payload.new : b))
            );
          } else if (payload.eventType === 'DELETE') {
            setBranches((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tally_boards',
          filter: `id=eq.${boardId}`
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setBoard(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, fetchBoardAndBranches]);

  const totalCount = useMemo(() => {
    return branches.reduce((sum, b) => sum + (Number(b.count) || 0), 0);
  }, [branches]);

  const addBranch = async ({ label }) => {
    setError(null);
    try {
      const position = branches.length;
      const { data, error: insertErr } = await supabase
        .from('tally_branches')
        .insert([
          {
            board_id: boardId,
            label: label.trim(),
            count: 0,
            position
          }
        ])
        .select()
        .single();

      if (insertErr) throw insertErr;
      setBranches((prev) => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteBranch = async (branchId) => {
    setError(null);
    try {
      const { error: delErr } = await supabase
        .from('tally_branches')
        .delete()
        .eq('id', branchId);

      if (delErr) throw delErr;
      setBranches((prev) => prev.filter((b) => b.id !== branchId));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateBranchLabel = async (branchId, newLabel) => {
    setError(null);
    try {
      const { error: updateErr } = await supabase
        .from('tally_branches')
        .update({ label: newLabel.trim() })
        .eq('id', branchId);

      if (updateErr) throw updateErr;
      setBranches((prev) =>
        prev.map((b) => (b.id === branchId ? { ...b, label: newLabel.trim() } : b))
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    board,
    branches,
    setBranches,
    totalCount,
    loading,
    error,
    refresh: fetchBoardAndBranches,
    addBranch,
    deleteBranch,
    updateBranchLabel
  };
}
