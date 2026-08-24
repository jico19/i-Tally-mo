import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useTallyActions(setBranches, allowNegative = false) {
  const [syncError, setSyncError] = useState(null);

  const adjustCount = useCallback(
    async (branchId, delta) => {
      setSyncError(null);
      let previousBranches = [];

      // 1. Optimistic Update
      setBranches((prev) => {
        previousBranches = prev;
        return prev.map((branch) => {
          if (branch.id === branchId) {
            const currentCount = Number(branch.count) || 0;
            let nextCount = currentCount + delta;
            if (!allowNegative && nextCount < 0) {
              nextCount = 0;
            }
            return { ...branch, count: nextCount };
          }
          return branch;
        });
      });

      // 2. Call RPC to update atomically on the database
      try {
        const { data, error } = await supabase.rpc('adjust_branch_count', {
          branch_id: branchId,
          delta: delta
        });

        if (error) throw error;

        // If returned data contains the exact confirmed count, sync it
        if (data) {
          setBranches((prev) =>
            prev.map((b) => (b.id === data.id ? { ...b, count: data.count } : b))
          );
        }
      } catch (err) {
        console.error('Failed to sync tally action:', err);
        setSyncError('Failed to sync counter with server. Reverting...');
        // Rollback
        setBranches(previousBranches);
      }
    },
    [setBranches, allowNegative]
  );

  const increment = useCallback(
    (branchId) => adjustCount(branchId, 1),
    [adjustCount]
  );

  const decrement = useCallback(
    (branchId) => adjustCount(branchId, -1),
    [adjustCount]
  );

  return {
    increment,
    decrement,
    syncError
  };
}
