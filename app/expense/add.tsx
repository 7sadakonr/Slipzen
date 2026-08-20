import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { CategoryPicker } from '../../features/categories/components/category-picker';
import { useCreateTransaction } from '../../features/transactions/hooks/use-create-transaction';
import { manualExpenseSchema } from '../../validation/expense';

export default function AddExpenseScreen() {
  const router = useRouter();
  const createTx = useCreateTransaction();

  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = async () => {
    try {
      setErrors({});
      // Validate
      const validData = manualExpenseSchema.parse({
        merchant,
        amount,
        categoryId,
        transactionDate: new Date(),
        note: note || undefined,
      });

      await createTx.mutateAsync(validData);
      
      Alert.alert('Success', 'Expense saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
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
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Input
          label="Merchant / Title"
          placeholder="e.g. Starbucks, Grocery"
          value={merchant}
          onChangeText={setMerchant}
          error={errors.merchant}
        />

        <Input
          label="Amount (THB)"
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          error={errors.amount}
        />

        <CategoryPicker 
          value={categoryId} 
          onChange={setCategoryId} 
          error={errors.categoryId}
        />

        <Input
          label="Note (Optional)"
          placeholder="Add a note"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          style={{ height: 80 }}
        />

        <Button 
          title="Save Expense" 
          onPress={handleSave} 
          loading={createTx.isPending}
          style={styles.button}
        />
        
        <Button 
          title="Cancel" 
          variant="secondary"
          onPress={() => router.back()} 
          style={styles.cancelButton}
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
  },
  button: {
    marginTop: 24,
  },
  cancelButton: {
    marginTop: 12,
  }
});
