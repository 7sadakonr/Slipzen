import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { CategoryPicker } from '../../features/categories/components/category-picker';
import { useBudgets } from '../../features/budgets/hooks/use-budgets';
import { useCreateBudget } from '../../features/budgets/hooks/use-create-budget';
import { useUpdateBudget } from '../../features/budgets/hooks/use-update-budget';
import { useDeleteBudget } from '../../features/budgets/hooks/use-delete-budget';
import { colors, spacing, typography, radius, shadows } from '../../theme';

export default function SetBudgetScreen() {
  const router = useRouter();
  const { id, type, month: paramMonth, year: paramYear } = useLocalSearchParams<{ id?: string, type?: string, month?: string, year?: string }>();
  
  // Always use current month for simplicity in MVP, or let user pick.
  // We'll use current month/year for setting new budgets.
  const currentMonth = paramMonth ? parseInt(paramMonth, 10) : new Date().getMonth() + 1;
  const currentYear = paramYear ? parseInt(paramYear, 10) : new Date().getFullYear();
  
  const { data: budgets } = useBudgets(currentMonth, currentYear);
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();
  
  const isEditing = !!id;
  const existingBudget = isEditing ? budgets?.find(b => b.id === id) : null;
  const isOverall = type === 'overall' || existingBudget?.category_id === null;

  const [limitAmount, setLimitAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (existingBudget) {
      setLimitAmount(existingBudget.limit_amount.toString());
      setCategoryId(existingBudget.category_id);
    }
  }, [existingBudget]);

  const handleSave = () => {
    const limit = parseFloat(limitAmount);
    if (isNaN(limit) || limit <= 0) {
      Alert.alert('Error', 'Please enter a valid amount greater than 0');
      return;
    }

    if (!isOverall && !categoryId) {
      Alert.alert('Error', 'Please select a category');
      return;
    }

    if (isEditing) {
      updateBudget.mutate(
        { id: id!, limitAmount: limit, month: currentMonth, year: currentYear },
        {
          onSuccess: () => router.back(),
          onError: (err) => Alert.alert('Error', err.message)
        }
      );
    } else {
      createBudget.mutate(
        { categoryId: isOverall ? null : categoryId, limitAmount: limit, month: currentMonth, year: currentYear },
        {
          onSuccess: () => router.back(),
          onError: (err) => Alert.alert('Error', err.message)
        }
      );
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Budget', 'Are you sure you want to delete this budget limit?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: () => {
          deleteBudget.mutate(
            { id: id!, month: currentMonth, year: currentYear },
            {
              onSuccess: () => router.back(),
              onError: (err) => Alert.alert('Error', err.message)
            }
          );
        }
      }
    ]);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Budget' : 'Set New Budget'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isOverall ? 'For all spending this month' : 'For a specific category this month'}
          </Text>

          {!isOverall && !isEditing && (
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Category</Text>
              <CategoryPicker
                value={categoryId}
                onChange={setCategoryId}
                error={undefined}
              />
            </View>
          )}

          {isEditing && !isOverall && (
            <View style={styles.readOnlyCategory}>
              <Text style={styles.label}>Category</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryIcon}>{existingBudget?.category?.icon}</Text>
                <Text style={styles.categoryName}>{existingBudget?.category?.name}</Text>
              </View>
            </View>
          )}

          <Input 
            label="Monthly Limit"
            value={limitAmount}
            onChangeText={setLimitAmount}
            placeholder="0.00"
            keyboardType="numeric"
          />
          
          <Button 
            title={isEditing ? "Save Changes" : "Create Budget"}
            onPress={handleSave}
            loading={createBudget.isPending || updateBudget.isPending}
            style={styles.saveButton}
          />
        </View>

        {isEditing && (
          <View style={styles.dangerZone}>
            <Button 
              title="Delete Budget"
              variant="danger"
              onPress={handleDelete}
              loading={deleteBudget.isPending}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...shadows.sm, marginBottom: spacing['2xl'] },
  headerTitle: { ...typography.title3, color: colors.textPrimary, marginBottom: spacing.xs },
  headerSubtitle: { ...typography.subhead, color: colors.textSecondary, marginBottom: spacing.xl },
  pickerContainer: { marginBottom: spacing.lg },
  label: { ...typography.subhead, color: colors.textPrimary, marginBottom: spacing.sm, fontWeight: '500' },
  readOnlyCategory: { marginBottom: spacing.lg },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, padding: spacing.md, borderRadius: radius.md },
  categoryIcon: { fontSize: 20, marginRight: spacing.sm },
  categoryName: { ...typography.body, color: colors.textPrimary },
  saveButton: { marginTop: spacing.md },
  dangerZone: { paddingHorizontal: spacing.sm },
});
