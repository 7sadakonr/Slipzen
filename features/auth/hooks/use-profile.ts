import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      const avatar_url = data.avatar_path
        ? supabase.storage.from('avatars').getPublicUrl(data.avatar_path).data.publicUrl
        : null;
      return { ...data, email: user.email, avatar_url };
    }
  });
}
