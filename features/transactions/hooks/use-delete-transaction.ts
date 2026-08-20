import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, receiptPath }: { id: string, receiptPath: string | null }) => {
      // 1. Delete image if exists
      if (receiptPath) {
        await supabase.storage.from('receipts').remove([receiptPath]);
      }

      // 2. Delete transaction (transaction_items are cascade deleted by DB)
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-status'] });
    }
  });
}
