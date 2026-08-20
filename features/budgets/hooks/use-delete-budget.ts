import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';


interface DeleteBudgetParams {
  id: string;
  month: number;
  year: number;
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: DeleteBudgetParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, { month, year }) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', month, year] });
      queryClient.invalidateQueries({ queryKey: ['budget-status', month, year] });
    },
  });
}
