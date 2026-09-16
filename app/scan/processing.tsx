import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  Easing,
  FadeInDown,
  FadeOutUp
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useReceiptStore } from '../../stores/receipt-store';
import { useScanReceipt } from '../../features/receipts/hooks/use-scan-receipt';
import { resolveCategory } from '../../features/categories/hooks/use-resolve-category';
import { queryClient } from '../../lib/query-client';
import { colors, typography, spacing, radius } from '../../theme';
import { ErrorView } from '../../components/feedback/error-view';
import { Button } from '../../components/ui/button';

const STEPS = [
  { text: 'Uploading secure receipt...', icon: 'cloud-upload-outline' },
  { text: 'Extracting text and amounts...', icon: 'scan-outline' },
  { text: 'Identifying merchant...', icon: 'storefront-outline' },
  { text: 'Categorizing expense...', icon: 'pricetag-outline' },
];

export default function ProcessingScreen() {
  const router = useRouter();
  const { storagePath, setAiResult, setResolvedCategory } = useReceiptStore();
  const scanReceipt = useScanReceipt();
  const [currentStep, setCurrentStep] = useState(0);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const progress = useSharedValue(0);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  useEffect(() => {
    if (!storagePath) {
      router.replace('/scan');
      return;
    }

    // Simulate progress steps
    const stepDuration = 2500; // 2.5s per step
    progress.value = withTiming(20, { duration: 500 });
    
    const timers: ReturnType<typeof setTimeout>[] = [];
    
    timers.push(setTimeout(() => {
      setCurrentStep(1);
      progress.value = withTiming(50, { duration: 1500 });
    }, stepDuration));
    
    timers.push(setTimeout(() => {
      setCurrentStep(2);
      progress.value = withTiming(80, { duration: 2000 });
    }, stepDuration * 2));
    
    timers.push(setTimeout(() => {
      setCurrentStep(3);
      progress.value = withTiming(95, { duration: 2500 });
    }, stepDuration * 3));

    // Actual API Call
    scanReceipt.mutateAsync(storagePath)
      .then(async (data) => {
        // Clear remaining timers if API returns fast
        timers.forEach(clearTimeout);
        
        setCurrentStep(3);
        progress.value = withTiming(100, { duration: 300 });
        
        setAiResult(data);

        // Fetch categories cache
        const categories = queryClient.getQueryData<any>(['categories']) || [];
        
        // Resolve category
        const resolved = await resolveCategory(
          data.merchant || '',
          data.suggested_category || null,
          data.confidence || 0,
          categories
        );
        
        setResolvedCategory(resolved);
        
        // Small delay to let 100% render before navigation
        setTimeout(() => {
          router.replace('/scan/review');
        }, 400);
      })
      .catch((error) => {
        timers.forEach(clearTimeout);
        setErrorMsg(error.message || 'Could not read the receipt.');
      });
      
    return () => timers.forEach(clearTimeout);
  }, [storagePath]);

  const CurrentIcon = STEPS[currentStep].icon as any;

  if (errorMsg) {
    return (
      <View style={styles.container}>
        <ErrorView 
          message={errorMsg} 
          onRetry={() => {
            setErrorMsg(null);
            setCurrentStep(0);
            progress.value = 0;
            // The useEffect won't re-run because storagePath didn't change,
            // so we'll need to manually trigger the mutation again.
            router.replace('/scan/processing'); 
          }}
          onAlternative={{
            label: "Add Manually",
            action: () => router.replace('/expense/add')
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        
        <Animated.View 
          key={`icon-${currentStep}`}
          entering={FadeInDown.duration(400)} 
          exiting={FadeOutUp.duration(300)}
          style={styles.iconContainer}
        >
          <Ionicons name={CurrentIcon} size={48} color={colors.primary} />
        </Animated.View>

        <Animated.Text 
          key={`text-${currentStep}`}
          entering={FadeInDown.delay(100).duration(400)}
          style={styles.title}
        >
          {STEPS[currentStep].text}
        </Animated.Text>
        
        <Text style={styles.subtitle}>Our AI is doing the heavy lifting</Text>

        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </View>
        
      </View>
      
      <View style={styles.footer}>
        <Button 
          title="Cancel" 
          variant="secondary" 
          onPress={() => router.replace('/')} 
          style={{ minWidth: 120 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    ...typography.title2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  footer: {
    padding: spacing['2xl'],
    paddingBottom: spacing['4xl'],
    alignItems: 'center',
  },
  cancelBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  }
});
