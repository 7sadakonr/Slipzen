import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { decode } from 'base64-arraybuffer';

export function useUploadReceipt() {
  const [isUploading, setIsUploading] = useState(false);

  const upload = async (base64Data: string, userId: string) => {
    setIsUploading(true);
    try {
      const fileName = `${userId}/${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(fileName, decode(base64Data), {
          contentType: 'image/jpeg',
        });

      if (error) throw error;
      return data.path;
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading };
}
