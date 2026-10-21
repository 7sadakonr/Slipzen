import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../lib/supabase';

export type AvatarSource = 'camera' | 'library';

const BUCKET = 'avatars';
const AVATAR_SIZE = 512;

/** Opens the camera or library, crops to a square and returns a resized JPEG as base64. */
export async function pickAvatarImage(source: AvatarSource): Promise<{ uri: string; base64: string } | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(
      source === 'camera' ? 'Camera permission is required.' : 'Photo library permission is required.'
    );
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

  if (result.canceled || !result.assets?.length) return null;

  const resized = await ImageManipulator.manipulateAsync(
    result.assets[0].uri,
    [{ resize: { width: AVATAR_SIZE, height: AVATAR_SIZE } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG, base64: true }
  );
  return { uri: resized.uri, base64: resized.base64! };
}

async function removeUserAvatars(userId: string) {
  const { data } = await supabase.storage.from(BUCKET).list(userId);
  if (data?.length) {
    await supabase.storage.from(BUCKET).remove(data.map((f) => `${userId}/${f.name}`));
  }
}

/** Uploads a new avatar, saves its path on the profile and deletes the previous files. */
export async function uploadAvatar(base64: string, userId: string): Promise<string> {
  const path = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, decode(base64), {
    contentType: 'image/jpeg',
  });
  if (error) throw error;

  const { error: updateError } = await supabase.from('profiles').update({ avatar_path: path }).eq('id', userId);
  if (updateError) throw updateError;

  // Clean up older avatars (best effort)
  const { data } = await supabase.storage.from(BUCKET).list(userId);
  const stale = (data ?? []).map((f) => `${userId}/${f.name}`).filter((p) => p !== path);
  if (stale.length) await supabase.storage.from(BUCKET).remove(stale);

  return path;
}

/** Change or remove the signed-in user's profile picture. */
export function useAvatarActions() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['profile'] });

  const change = useMutation({
    mutationFn: async (source: AvatarSource) => {
      const picked = await pickAvatarImage(source);
      if (!picked) return null;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      return uploadAvatar(picked.base64, user.id);
    },
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      const { error } = await supabase.from('profiles').update({ avatar_path: null }).eq('id', user.id);
      if (error) throw error;
      await removeUserAvatars(user.id);
    },
    onSuccess: refresh,
  });

  return { change, remove, isBusy: change.isPending || remove.isPending };
}
