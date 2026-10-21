import React from 'react';
import { View, Text, TouchableOpacity, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Glass } from '../components/ui/glass';
import { GraphiteCard } from '../components/ui/graphite-card';
import { ScreenGradient } from '../components/ui/screen-gradient';
import { typography, spacing, radius, makeStyles, useTheme } from '../theme';
import { useReceiptStore } from '../stores/receipt-store';

type ActionId = 'scan' | 'photo' | 'manual';

const SECONDARY: { id: ActionId; icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string }[] = [
  { id: 'photo', icon: 'image-outline', title: 'From photo', subtitle: 'Pick a receipt from your library' },
  { id: 'manual', icon: 'create-outline', title: 'Manual', subtitle: 'Type in an expense yourself' },
];

export default function AddActionsSheet() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setImage } = useReceiptStore();

  const handleAction = async (id: ActionId) => {
    Haptics.selectionAsync().catch(() => {});

    if (id === 'scan') {
      router.dismiss();
      setTimeout(() => router.push('/scan'), 50);
    } else if (id === 'manual') {
      router.dismiss();
      setTimeout(() => router.push('/expense/add'), 50);
    } else if (id === 'photo') {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Photo access needed', 'Allow Slipzen to access your photos in Settings to import a receipt.');
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
      <ScreenGradient />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Add expense</Text>
          <Text style={styles.subtitle}>How would you like to add it?</Text>
        </View>
        <TouchableOpacity onPress={() => router.dismiss()} accessibilityRole="button" accessibilityLabel="Close">
          <Glass isInteractive style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textPrimary} />
          </Glass>
        </TouchableOpacity>
      </View>

      <Animated.View entering={FadeInDown.duration(300)} style={styles.heroWrap}>
        <GraphiteCard padding={0} radius={28}>
          <Pressable
            onPress={() => handleAction('scan')}
            accessibilityRole="button"
            accessibilityLabel="Scan receipt"
            accessibilityHint="Take a photo of a receipt and let AI read it"
            style={({ pressed }) => [styles.hero, pressed && { opacity: 0.85 }]}
          >
            <View style={styles.heroIcon}>
              <Ionicons name="scan" size={28} color="#0A0A0A" />
            </View>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Scan receipt</Text>
              <Text style={styles.heroSubtitle}>Take a photo and AI fills in the details</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </Pressable>
        </GraphiteCard>
      </Animated.View>

      <View style={styles.row}>
        {SECONDARY.map((action, i) => (
          <Animated.View key={action.id} entering={FadeInDown.delay(80 * (i + 1)).duration(300)} style={styles.cell}>
            <Pressable
              onPress={() => handleAction(action.id)}
              accessibilityRole="button"
              accessibilityLabel={action.title}
              accessibilityHint={action.subtitle}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
            >
              <View style={styles.cardIcon}>
                <Ionicons name={action.icon} size={22} color={colors.textPrimary} />
              </View>
              <Text style={styles.cardTitle}>{action.title}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={2}>
                {action.subtitle}
              </Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: { ...typography.title1, color: colors.textPrimary },
  subtitle: { ...typography.subhead, color: colors.textSecondary, marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroWrap: { marginBottom: spacing.md },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { flex: 1 },
  heroTitle: { ...typography.title3, color: '#FFFFFF' },
  heroSubtitle: { ...typography.footnote, color: '#FFFFFF', opacity: 0.7, marginTop: 2 },
  row: { flexDirection: 'row', gap: spacing.md },
  cell: { flex: 1 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    minHeight: 132,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cardTitle: { ...typography.headline, color: colors.textPrimary },
  cardSubtitle: { ...typography.footnote, color: colors.textSecondary, marginTop: 2 },
}));
