import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { queryClient } from '../../../lib/query-client';
import { checkAndTriggerBudgetAlerts } from '../../budgets/hooks/use-budget-alerts';

export interface UpdateTransactionParams {
  id: string;
  merchant: string;
  amount: number;
  categoryId: string;
  note?: string;
  paymentMethod?: string;
}

export function useUpdateTransaction() {
  return useMutation({
    mutationFn: async (params: UpdateTransactionParams) => {
      const { error } = await supabase
        .from('transactions')
        .update({
          merchant: params.merchant,
          amount: params.amount,
          category_id: params.categoryId,
          note: params.note || null,
          payment_method: params.paymentMethod || null,
        })
        .eq('id', params.id);
        
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-status'] });

      const d = new Date();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          checkAndTriggerBudgetAlerts(user.id, d.getMonth() + 1, d.getFullYear());
        }
      });
    }
  });
}
