import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';


interface CreateBudgetParams {
  categoryId: string | null;
  month: number;
  year: number;
  limitAmount: number;
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ categoryId, month, year, limitAmount }: CreateBudgetParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category_id: categoryId,
          month,
          year,
          limit_amount: limitAmount,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('A budget already exists for this category in this month.');
        }
        throw error;
      }
      
      return data;
    },
    onSuccess: (_, { month, year }) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', month, year] });
      queryClient.invalidateQueries({ queryKey: ['budget-status', month, year] });
      
      // Request notification permission if they just created a budget
      const { requestNotificationPermission } = require('../../../utils/notifications');
      requestNotificationPermission();
    },
  });
}
