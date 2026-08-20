import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';


interface UpdateBudgetParams {
  id: string;
  limitAmount: number;
  month: number;
  year: number;
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, limitAmount }: UpdateBudgetParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('budgets')
        .update({
          limit_amount: limitAmount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { month, year }) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', month, year] });
      queryClient.invalidateQueries({ queryKey: ['budget-status', month, year] });
    },
  });
}
