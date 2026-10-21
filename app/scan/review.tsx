import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { differenceInDays, format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReceiptStore } from '../../stores/receipt-store';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { CategoryPicker } from '../../features/categories/components/category-picker';
import { useCreateTransaction } from '../../features/transactions/hooks/use-create-transaction';
import { manualExpenseSchema } from '../../validation/expense';
import { normalizeMerchant } from '../../utils/normalize';
import { queryClient } from '../../lib/query-client';
import { makeStyles, useTheme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';
import { StepIndicator } from '../../components/ui/step-indicator';
import { DateField } from '../../components/ui/date-field';
import { ChipSelect, PAYMENT_METHODS } from '../../components/ui/chip-select';
import { useProfile } from '../../features/auth/hooks/use-profile';
import { toast } from '../../lib/toast-store';

export default function ReviewScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { aiResult, storagePath, resolvedCategory, clear } = useReceiptStore();
  const { data: profile } = useProfile();
  const currency = profile?.currency || 'THB';

  const [merchant, setMerchant] = useState(aiResult?.merchant || '');
  const [amount, setAmount] = useState(aiResult?.amount?.toString() || '');
  // The AI sometimes misreads years (e.g. Buddhist-era dates). Don't trust a date that is
  // in the future or more than 90 days old; use today and tell the user what it read.
  const aiDate = aiResult?.date ? new Date(aiResult.date) : null;
  const aiDateValid = !!aiDate && !isNaN(aiDate.getTime());
  const aiDateSuspicious =
    aiDateValid && (aiDate! > new Date() || differenceInDays(new Date(), aiDate!) > 90);
  const [date, setDate] = useState<Date>(() => (aiDateValid && !aiDateSuspicious ? aiDate! : new Date()));
  const [dateTouched, setDateTouched] = useState(false);
  // Map AI payment labels onto the chips we offer
  const normalizePayment = (v?: string | null) =>
    v === 'debit_card' ? 'credit_card' : v === 'qr_code' ? 'transfer' : v || '';
  const [paymentMethod, setPaymentMethod] = useState(normalizePayment(aiResult?.payment_method));
  
  // Use resolved category if available, otherwise null
  const [categoryId, setCategoryId] = useState<string | null>(resolvedCategory?.categoryId || null);
  const [userChangedCategory, setUserChangedCategory] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(!resolvedCategory);
  
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrors({});
      
      const transactionDate = date;

      const validData = manualExpenseSchema.parse({
        merchant,
        amount,
        categoryId: categoryId,
        transactionDate,
        note: note || undefined,
      });

      const { supabase } = require('../../lib/supabase');
      const { data: user } = await supabase.auth.getUser();
      
      const itemsToSave = (aiResult?.items || []).map((item: any) => ({
        ...item,
        unit_price: item.unit_price ?? (item.total_price / (item.quantity || 1))
      }));

      // If user kept the AI suggested new category, it's a new category
      // If user changed it via picker, it's NOT a new category (since picker only shows existing)
      const isNewCategory = resolvedCategory?.isNew && !userChangedCategory;

      const { error: rpcError } = await supabase.rpc('save_receipt_transaction', {
        p_merchant: validData.merchant,
        p_amount: validData.amount,
        p_currency: currency,
        p_category_id: isNewCategory ? null : validData.categoryId,
        p_category_name: isNewCategory ? resolvedCategory.categoryName : null,
        p_category_normalized: isNewCategory ? resolvedCategory.categoryName.toLowerCase().trim() : null,
        p_is_new_category: isNewCategory,
        p_payment_method: paymentMethod || null,
        p_transaction_date: validData.transactionDate.toISOString(),
        p_note: validData.note,
        p_receipt_path: storagePath,
        p_source: useReceiptStore.getState().source === 'gallery' ? 'receipt_gallery' : 'receipt_ai',
        p_ai_confidence: aiResult?.confidence,
        p_items: itemsToSave,
        p_merchant_normalized: normalizeMerchant(validData.merchant),
        p_rule_source: userChangedCategory ? 'user' : 'ai',
      });

      if (rpcError) throw rpcError;
      
      // Invalidate caches
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-status'] });

      // Check budget alerts
      if (user?.user) {
        const d = validData.transactionDate;
        // checkAndTriggerBudgetAlerts requires importing
        const { checkAndTriggerBudgetAlerts } = require('../../features/budgets/hooks/use-budget-alerts');
        checkAndTriggerBudgetAlerts(user.user.id, d.getMonth() + 1, d.getFullYear());
      }

      clear();
      router.dismissAll();
      router.replace('/(tabs)');
      toast.success('Receipt saved');
    } catch (err: any) {
      if (err.errors) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((e: any) => {
          if (e.path[0]) fieldErrors[e.path[0].toString()] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        Alert.alert('Error', err.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getBadgeColor = (source?: string) => {
    switch(source) {
      case 'merchant_rule': return colors.success;
      case 'ai_match': return colors.textPrimary;
      case 'ai_new': return colors.warning;
      default: return colors.textMuted;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={() => {
            clear();
            router.dismissAll();
          }}
          disabled={isSaving}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Cancel and discard this receipt"
        >
          <Text style={styles.topCancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.topTitle}>Review receipt</Text>
        <View style={styles.topSpacer} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.stepWrap}>
          <StepIndicator step={3} label="Confirm details" />
        </View>
        <View style={styles.aiBanner}>
          <View style={styles.aiTitleRow}>
            <Ionicons name="sparkles-outline" size={16} color={colors.textPrimary} />
            <Text style={styles.aiText}>AI found these details</Text>
          </View>
          {aiResult?.confidence && (
            <Text style={styles.aiConfidence}>Confidence: {(aiResult.confidence * 100).toFixed(0)}%</Text>
          )}
        </View>

        <Input
          label="Merchant"
          value={merchant}
          onChangeText={setMerchant}
          error={errors.merchant}
        />

        <Input
          label={`Amount (${currency})`}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          error={errors.amount}
        />

        <DateField
          label="Date"
          value={date}
          onChange={(d) => {
            setDate(d);
            setDateTouched(true);
          }}
          hint={
            aiDateSuspicious && !dateTouched && aiDate
              ? `The receipt looked like ${format(aiDate, 'd MMM yyyy')}. We used today instead — change it if that's wrong.`
              : undefined
          }
        />

        <ChipSelect
          label="Paid with"
          options={PAYMENT_METHODS}
          value={paymentMethod}
          onChange={setPaymentMethod}
        />

        <View style={styles.categorySection}>
          <Text style={styles.label}>Category</Text>
          
          {!showCategoryPicker && resolvedCategory ? (
            <View style={styles.resolvedCategoryBox}>
              <View style={styles.resolvedTop}>
                <Text style={styles.resolvedName}>
                  {resolvedCategory.isNew ? `${resolvedCategory.categoryName} (new)` : resolvedCategory.categoryName}
                </Text>
                <Button 
                  title="Change" 
                  variant="secondary" 
                  size="sm"
                  onPress={() => setShowCategoryPicker(true)} 
                />
              </View>
              <Text style={[styles.resolvedLabel, { color: getBadgeColor(resolvedCategory.source) }]}>
                {resolvedCategory.label}
              </Text>
            </View>
          ) : (
            <CategoryPicker 
              value={categoryId} 
              onChange={(id) => {
                setCategoryId(id);
                setUserChangedCategory(true);
              }} 
              error={errors.categoryId}
            />
          )}
        </View>

        {aiResult?.items && aiResult.items.length > 0 && (
          <View style={styles.itemsContainer}>
            <Text style={styles.itemsTitle}>Detected Items</Text>
            {aiResult.items.map((item: any, idx: number) => (
              <View key={idx} style={styles.itemRow}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>{item.total_price} {currency}</Text>
              </View>
            ))}
          </View>
        )}

        <Input
          label="Note (Optional)"
          value={note}
          onChangeText={setNote}
          multiline
          style={{ height: 60 }}
        />

        <Button 
          title="Save receipt" 
          onPress={handleSave} 
          loading={isSaving}
          style={styles.button}
        />
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 12,
    paddingBottom: 64,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  topCancel: { fontSize: 17, color: colors.textPrimary },
  topTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  topSpacer: { width: 52 },
  stepWrap: { marginBottom: 20 },
  aiBanner: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  aiText: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
  aiConfidence: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  categorySection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  resolvedCategoryBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    backgroundColor: colors.surface,
  },
  resolvedTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resolvedName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  changeBtn: {
    color: colors.textPrimary,
    fontWeight: '500',
  },
  resolvedLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemsContainer: {
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  itemsTitle: {
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    color: colors.textPrimary,
    marginRight: 16,
  },
  itemPrice: {
    fontWeight: '500',
    color: colors.textPrimary,
  },
  button: {
    marginTop: 12,
  },
  cancelButton: {
    marginTop: 12,
  }
}));
