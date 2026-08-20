import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';


interface UpdateCategoryParams {
  id: string;
  name: string;
  icon: string;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: async ({ id, name, icon }: UpdateCategoryParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const normalized_name = name.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('categories')
        .update({
          name,
          normalized_name,
          icon,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] }); // Re-fetch transactions to show updated category name/icon
    },
  });
}
