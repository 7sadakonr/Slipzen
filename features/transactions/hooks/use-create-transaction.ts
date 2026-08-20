import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';
import { ManualExpenseInput } from '../../../validation/expense';
import { checkAndTriggerBudgetAlerts } from '../../budgets/hooks/use-budget-alerts';

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ManualExpenseInput) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not logged in');

      const { data: result, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.user.id,
          merchant: data.merchant,
          amount: data.amount,
          category_id: data.categoryId,
          transaction_date: data.transactionDate.toISOString(),
          note: data.note,
          source: 'manual',
          currency: 'THB',
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      // Invalidate dashboard and transactions list
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-status'] });

      // Check alerts
      if (variables) {
        const d = new Date(variables.transactionDate);
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            checkAndTriggerBudgetAlerts(user.id, d.getMonth() + 1, d.getFullYear());
          }
        });
      }
    },
  });
}
