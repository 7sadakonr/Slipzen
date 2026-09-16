import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useReceiptStore } from '../../stores/receipt-store';

interface AddExpenseSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AddExpenseSheet({ visible, onClose }: AddExpenseSheetProps) {
  const router = useRouter();
  const { setImage, clear } = useReceiptStore();

  const handleScanReceipt = () => {
    onClose();
    clear();
    router.push('/scan');
  };

  const handleImportReceipt = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to import receipts.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onClose();
        clear();
        const asset = result.assets[0];
        setImage(asset.uri, 'gallery', asset.base64 || undefined);
        router.push('/scan/preview');
      }
    } catch (error) {
      console.error('Error importing receipt:', error);
    }
  };

  const handleManualAdd = () => {
    onClose();
    router.push('/expense/add');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <View style={styles.sheet}>
          <View style={styles.indicator} />
          
          <View style={styles.contentContainer}>
            <Text style={styles.title}>Add Expense</Text>
            
            <View style={styles.optionsGrid}>
              <TouchableOpacity style={styles.optionBtn} onPress={handleScanReceipt}>
                <View style={[styles.iconBox, { backgroundColor: colors.primarySoft }]}>
                  <Ionicons name="camera" size={28} color={colors.primary} />
                </View>
                <Text style={styles.optionText}>Scan Receipt</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionBtn} onPress={handleImportReceipt}>
                <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                  <Ionicons name="image" size={28} color={colors.success} />
                </View>
                <Text style={styles.optionText}>Import Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.optionBtn} onPress={handleManualAdd}>
                <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                  <Ionicons name="pencil" size={28} color={colors.warning} />
                </View>
                <Text style={styles.optionText}>Add Manually</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.sm,
    ...shadows.lg,
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  contentContainer: {
    padding: spacing['2xl'],
    alignItems: 'center',
    paddingBottom: spacing['3xl'] + 20, // Extra padding for safe area
  },
  title: {
    ...typography.title3,
    color: colors.textPrimary,
    marginBottom: spacing['2xl'],
    alignSelf: 'flex-start',
  },
  optionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  optionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  optionText: {
    ...typography.subhead,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
