import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

async function removeFolder(bucket: string, userId: string) {
  const { data } = await supabase.storage.from(bucket).list(userId, { limit: 1000 });
  if (data?.length) {
    await supabase.storage.from(bucket).remove(data.map((f) => `${userId}/${f.name}`));
  }
}

/** Permanently deletes the signed-in user's files, data and auth account, then signs out. */
export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      // Storage files are not covered by foreign-key cascades
      await Promise.all([removeFolder('receipts', user.id), removeFolder('avatars', user.id)]);

      const { error } = await supabase.rpc('delete_account');
      if (error) throw error;

      await supabase.auth.signOut();
    },
    onSuccess: () => queryClient.clear(),
  });
}
