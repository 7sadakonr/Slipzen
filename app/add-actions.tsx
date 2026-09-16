import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { GlassView } from 'expo-glass-effect';
import { colors, typography, spacing, radius } from '../theme';
import { useReceiptStore } from '../stores/receipt-store';

const actions = [
  {
    id: 'scan',
    icon: 'camera-outline' as const,
    title: 'Scan Receipt',
    subtitle: 'Scan a physical receipt',
  },
  {
    id: 'ereceipt',
    icon: 'image-outline' as const,
    title: 'E-Receipt',
    subtitle: 'Import an electronic receipt',
  },
  {
    id: 'manual',
    icon: 'create-outline' as const,
    title: 'Manual Expense',
    subtitle: 'Enter expense manually',
  },
];

export default function AddActionsSheet() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setImage } = useReceiptStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleAction = async (id: string) => {
    Haptics.selectionAsync().catch(() => {});
    
    if (id === 'scan') {
      router.dismiss();
      setTimeout(() => router.push('/scan'), 50);
    } else if (id === 'manual') {
      router.dismiss();
      setTimeout(() => router.push('/expense/add'), 50);
    } else if (id === 'ereceipt') {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission to access camera roll is required!");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, 
        quality: 1,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        const uri = pickerResult.assets[0].uri;
        setImage(uri, 'gallery');
        router.dismiss();
        setTimeout(() => router.push('/scan/preview'), 50);
      }
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}>
      <Text style={styles.title}>Add Expense</Text>

      {actions.map((action, index) => (
        <GlassView
          key={index}
          isInteractive
          glassEffectStyle="regular"
          tintColor={colors.surface}
          style={styles.actionGlass}
        >
          <TouchableOpacity
            style={styles.actionInner}
            onPress={() => handleAction(action.id)}
            accessibilityLabel={action.title}
            accessibilityHint={action.subtitle}
          >
            <View style={[styles.iconCircle, isDark && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name={action.icon} size={22} color={isDark ? '#fff' : colors.primary} />
            </View>
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, isDark && { color: '#fff' }]}>{action.title}</Text>
              <Text style={[styles.actionSubtitle, isDark && { color: 'rgba(255,255,255,0.7)' }]}>{action.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDark ? 'rgba(255,255,255,0.5)' : colors.textMuted} />
          </TouchableOpacity>
        </GlassView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    backgroundColor: colors.surface,
  },
  title: {
    ...typography.title2,
    color: colors.textPrimary,
    marginBottom: spacing['2xl'],
    textAlign: 'center',
  },
  actionGlass: {
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  actionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actionSubtitle: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
