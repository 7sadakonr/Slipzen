import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';


interface MergeCategoryParams {
  sourceCategoryId: string;
  targetCategoryId: string;
}

export function useMergeCategory() {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: async ({ sourceCategoryId, targetCategoryId }: MergeCategoryParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase.rpc('merge_categories', {
        p_source_category_id: sourceCategoryId,
        p_target_category_id: targetCategoryId,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}
