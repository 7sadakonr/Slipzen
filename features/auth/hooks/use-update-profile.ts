import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

interface UpdateProfileParams {
  displayName?: string;
  currency?: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateProfileParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const updates: any = {};
      if (params.displayName !== undefined) updates.display_name = params.displayName;
      if (params.currency !== undefined) updates.currency = params.currency;

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    }
  });
}
