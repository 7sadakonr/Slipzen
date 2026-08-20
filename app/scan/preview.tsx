import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useReceiptStore } from '../../stores/receipt-store';
import { Button } from '../../components/ui/button';
import { compressImage } from '../../utils/image';
import { useUploadReceipt } from '../../features/receipts/hooks/use-upload-receipt';
import { supabase } from '../../lib/supabase';

export default function PreviewScreen() {
  const router = useRouter();
  const { imageUri, setImage, setStoragePath } = useReceiptStore();
  const { upload, isUploading } = useUploadReceipt();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!imageUri) {
    router.replace('/scan');
    return null;
  }

  const handleUsePhoto = async () => {
    try {
      setIsProcessing(true);
      
      // 1. Compress image
      const compressed = await compressImage(imageUri);
      
      // Save compressed base64 back to store
      const currentSource = useReceiptStore.getState().source || 'camera';
      setImage(compressed.uri, currentSource, compressed.base64);

      // 2. Get User ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // 3. Upload to Supabase Storage
      const storagePath = await upload(compressed.base64!, user.id);
      setStoragePath(storagePath);

      // 4. Move to Processing Screen
      router.push('/scan/processing');
      
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
      
      <View style={styles.footer}>
        <Button 
          title="Retake" 
          variant="secondary" 
          onPress={() => router.back()} 
          style={styles.button}
          disabled={isProcessing || isUploading}
        />
        <Button 
          title="Use Photo" 
          onPress={handleUsePhoto} 
          loading={isProcessing || isUploading}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: 48,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.8)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  }
});
