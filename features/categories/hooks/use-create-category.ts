import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';


interface CreateCategoryParams {
  name: string;
  icon: string;
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  

  return useMutation({
    mutationFn: async ({ name, icon }: CreateCategoryParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const normalized_name = name.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name,
          normalized_name,
          icon,
          created_by: 'user',
          ai_generated: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
