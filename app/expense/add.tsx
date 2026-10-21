import React, { useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { CategoryPicker } from '../../features/categories/components/category-picker';
import { useCreateTransaction } from '../../features/transactions/hooks/use-create-transaction';
import { manualExpenseSchema } from '../../validation/expense';
import { makeStyles, typography, useTheme } from '../../theme';
import { useProfile } from '../../features/auth/hooks/use-profile';
import { toast } from '../../lib/toast-store';
import { DateField } from '../../components/ui/date-field';

export default function AddExpenseScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const router = useRouter();
  const { data: profile } = useProfile();
  const currency = profile?.currency || 'THB';
  const merchantRef = useRef<TextInput>(null);
  const noteRef = useRef<TextInput>(null);
  const createTx = useCreateTransaction();

  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    try {
      setErrors({});
      // Validate
      const validData = manualExpenseSchema.parse({
        merchant,
        amount,
        categoryId,
        transactionDate: date,
        note: note || undefined,
      });

      await createTx.mutateAsync({ ...validData, currency });
      
      toast.success('Expense saved');
      router.back();
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
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currencyText}>{currency}</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => merchantRef.current?.focus()}
              selectionColor={colors.accent}
              accessibilityLabel={`Amount in ${currency}`}
            />
          </View>
          {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
        </View>

        <Input
          ref={merchantRef}
          label="Merchant / Title"
          placeholder="e.g. Starbucks, Grocery"
          value={merchant}
          onChangeText={setMerchant}
          error={errors.merchant}
          returnKeyType="next"
          onSubmitEditing={() => noteRef.current?.focus()}
        />

        <CategoryPicker 
          value={categoryId} 
          onChange={setCategoryId} 
          error={errors.categoryId}
        />

        <DateField label="Date" value={date} onChange={setDate} />

        <Input
          ref={noteRef}
          label="Note (optional)"
          placeholder="Add a note"
          value={note}
          onChangeText={setNote}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <Button 
          title="Save expense" 
          onPress={handleSave} 
          loading={createTx.isPending}
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
    paddingBottom: 48,
  },
  amountBlock: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
  },
  amountLabel: {
    ...typography.footnote,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  currencyText: {
    ...typography.title2,
    color: colors.textSecondary,
  },
  amountInput: {
    ...typography.amount,
    fontSize: 48,
    color: colors.textPrimary,
    minWidth: 120,
    textAlign: 'center',
    padding: 0,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  button: {
    marginTop: 16,
  },
}));
