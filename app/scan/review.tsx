import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useReceiptStore } from '../../stores/receipt-store';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { CategoryPicker } from '../../features/categories/components/category-picker';
import { useCreateTransaction } from '../../features/transactions/hooks/use-create-transaction';
import { manualExpenseSchema } from '../../validation/expense';
import { normalizeMerchant } from '../../utils/normalize';
import { queryClient } from '../../lib/query-client';

export default function ReviewScreen() {
  const router = useRouter();
  const { aiResult, storagePath, resolvedCategory, clear } = useReceiptStore();

  const [merchant, setMerchant] = useState(aiResult?.merchant || '');
  const [amount, setAmount] = useState(aiResult?.amount?.toString() || '');
  const [dateStr, setDateStr] = useState(aiResult?.date || new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState(aiResult?.payment_method || '');
  
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
      
      const transactionDate = new Date(dateStr);
      if (isNaN(transactionDate.getTime())) {
        setErrors({ dateStr: 'Invalid date format (YYYY-MM-DD)' });
        return;
      }

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
        p_currency: 'THB',
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

      Alert.alert('Success', 'Receipt saved successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            clear();
            router.dismissAll();
            router.replace('/(tabs)');
          } 
        }
      ]);
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
      case 'merchant_rule': return '#34C759'; // Green
      case 'ai_match': return '#007AFF'; // Blue
      case 'ai_new': return '#FF9500'; // Orange
      default: return '#8E8E93'; // Gray
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.aiBanner}>
          <Text style={styles.aiText}>✨ AI found the following details</Text>
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

        <View style={{flexDirection: 'row', gap: 12}}>
          <View style={{flex: 1}}>
            <Input
              label="Amount (THB)"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              error={errors.amount}
            />
          </View>
          <View style={{flex: 1}}>
            <Input
              label="Date (YYYY-MM-DD)"
              value={dateStr}
              onChangeText={setDateStr}
              error={errors.dateStr}
            />
          </View>
        </View>

        <Input
          label="Payment Method"
          value={paymentMethod}
          onChangeText={setPaymentMethod}
          placeholder="e.g. credit_card, cash"
        />

        <View style={styles.categorySection}>
          <Text style={styles.label}>Category</Text>
          
          {!showCategoryPicker && resolvedCategory ? (
            <View style={styles.resolvedCategoryBox}>
              <View style={styles.resolvedTop}>
                <Text style={styles.resolvedName}>
                  {resolvedCategory.isNew ? `🆕 ${resolvedCategory.categoryName}` : resolvedCategory.categoryName}
                </Text>
                <TouchableOpacity onPress={() => setShowCategoryPicker(true)}>
                  <Text style={styles.changeBtn}>Change</Text>
                </TouchableOpacity>
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
                <Text style={styles.itemPrice}>{item.total_price} THB</Text>
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
          title="Confirm & Save" 
          onPress={handleSave} 
          loading={isSaving}
          style={styles.button}
        />
        
        <Button 
          title="Cancel" 
          variant="secondary"
          onPress={() => {
            clear();
            router.dismissAll();
          }} 
          style={styles.cancelButton}
          disabled={isSaving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 48,
  },
  aiBanner: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  aiText: {
    fontWeight: '600',
    color: '#007AFF',
  },
  aiConfidence: {
    color: '#666',
    fontSize: 12,
  },
  categorySection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  resolvedCategoryBox: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F0F8FF',
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
    color: '#333',
  },
  changeBtn: {
    color: '#007AFF',
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
    borderColor: '#e5e5ea',
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
  },
  itemsTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    flex: 1,
    color: '#333',
    marginRight: 16,
  },
  itemPrice: {
    fontWeight: '500',
  },
  button: {
    marginTop: 12,
  },
  cancelButton: {
    marginTop: 12,
  }
});
