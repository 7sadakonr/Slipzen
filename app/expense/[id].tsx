import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useTransactionDetail } from '../../features/transactions/hooks/use-transaction-detail';
import { useDeleteTransaction } from '../../features/transactions/hooks/use-delete-transaction';
import { useUpdateTransaction } from '../../features/transactions/hooks/use-update-transaction';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { CategoryPicker } from '../../features/categories/components/category-picker';
import { Ionicons } from '@expo/vector-icons';
import { Glass } from '../../components/ui/glass';
import { DateField } from '../../components/ui/date-field';
import { ChipSelect, PAYMENT_METHODS } from '../../components/ui/chip-select';
import { typography, spacing, radius, makeStyles, useTheme } from '../../theme';

export default function ExpenseDetailScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const { data: transaction, isLoading, isError } = useTransactionDetail(id as string);
  const deleteMutation = useDeleteTransaction();
  const updateMutation = useUpdateTransaction();

  const [isEditing, setIsEditing] = useState(false);
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [note, setNote] = useState('');
  const [imageLoading, setImageLoading] = useState(true);

  // Sync state when entering edit mode
  useEffect(() => {
    if (transaction && isEditing) {
      setMerchant(transaction.merchant);
      setAmount(transaction.amount.toString());
      setCategoryId(transaction.category_id);
      setPaymentMethod(transaction.payment_method || '');
      setDate(new Date(transaction.transaction_date));
      setNote(transaction.note || '');
    }
  }, [transaction, isEditing]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.textSecondary} />
      </View>
    );
  }

  if (isError || !transaction) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load details.</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{marginTop: 16}} />
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: () => {
          deleteMutation.mutate(
            { id: transaction.id, receiptPath: transaction.receipt_path },
            {
              onSuccess: () => router.back(),
              onError: (err) => Alert.alert('Error', err.message)
            }
          );
        }
      }
    ]);
  };

  const handleSave = () => {
    if (!merchant || !amount) {
      Alert.alert('Error', 'Merchant and Amount are required.');
      return;
    }

    updateMutation.mutate(
      {
        id: transaction.id,
        merchant,
        amount: parseFloat(amount),
        categoryId: categoryId!,
        paymentMethod,
        transactionDate: date,
        note,
      },
      {
        onSuccess: () => setIsEditing(false),
        onError: (err) => Alert.alert('Error', err.message)
      }
    );
  };

  const displayAmount = parseFloat(transaction.amount).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const categoryName = transaction.categories?.name || 'Uncategorized';
  const categoryIcon = transaction.categories?.icon || '📦';

  if (isEditing) {
    return (
      <KeyboardAvoidingView 
        style={{flex: 1, backgroundColor: colors.background}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.editHeader}>
            <Glass isInteractive style={styles.iconBtnGlass}>
              <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.iconBtnInner} accessibilityRole="button" accessibilityLabel="Cancel editing">
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </Glass>
            <Text style={styles.editTitle}>Edit Expense</Text>
            <View style={{width: 28}} />
          </View>

          <Input label="Merchant" value={merchant} onChangeText={setMerchant} />
          <Input label={`Amount (${transaction.currency || 'THB'})`} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
          <CategoryPicker value={categoryId} onChange={setCategoryId} />
          <DateField label="Date" value={date} onChange={setDate} />
          <ChipSelect label="Paid with" options={PAYMENT_METHODS} value={paymentMethod} onChange={setPaymentMethod} />
          <Input label="Note" value={note} onChangeText={setNote} multiline style={{height: 60}} />

          <Button 
            title="Save Changes" 
            onPress={handleSave} 
            loading={updateMutation.isPending}
            style={{marginTop: spacing['2xl']}}
          />
          <Button title="Cancel" variant="secondary" onPress={() => setIsEditing(false)} style={{marginTop: spacing.md}} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.amount}>฿{displayAmount}</Text>
        <Text style={styles.merchant}>{transaction.merchant}</Text>
        <Text style={styles.date}>{format(new Date(transaction.transaction_date), 'dd MMMM yyyy, HH:mm')}</Text>
        {transaction.source === 'receipt_ai' && (
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.aiBadgeText}>Scanned by AI</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.section} activeOpacity={0.7} onPress={() => setIsEditing(true)} accessibilityRole="button" accessibilityLabel="Change category">
        <Text style={styles.label}>Category</Text>
        <Text style={styles.value}>{transaction.categories?.icon ? `${categoryIcon}  ` : ''}{categoryName}</Text>
      </TouchableOpacity>

      {transaction.payment_method && (
        <View style={styles.section}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>{PAYMENT_METHODS.find((o) => o.value === transaction.payment_method)?.label ?? transaction.payment_method}</Text>
        </View>
      )}

      {transaction.note && (
        <View style={styles.section}>
          <Text style={styles.label}>Note</Text>
          <Text style={styles.value}>{transaction.note}</Text>
        </View>
      )}

      {transaction.transaction_items && transaction.transaction_items.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.label}>Items</Text>
          {transaction.transaction_items.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
              </Text>
              <Text style={styles.itemPrice}>
                ฿{parseFloat(item.total_price).toLocaleString('th-TH', {minimumFractionDigits: 2})}
              </Text>
            </View>
          ))}
        </View>
      )}

      {transaction.signed_receipt_url && (
        <View style={styles.section}>
          <Text style={styles.label}>Receipt Image</Text>
          <View style={styles.imageContainer}>
            {imageLoading && (
              <View style={styles.imageLoader}>
                <ActivityIndicator color={colors.textSecondary} />
              </View>
            )}
            <Image 
              source={{ uri: transaction.signed_receipt_url }} 
              style={[styles.receiptImage, imageLoading && { opacity: 0 }]} 
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <Button title="Edit expense" variant="secondary" onPress={() => setIsEditing(true)} />
        <Button title="Delete expense" variant="danger" onPress={handleDelete} loading={deleteMutation.isPending} />
      </View>
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  actions: { gap: spacing.md, marginTop: spacing.lg },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing['2xl'], paddingBottom: 48 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: colors.danger, ...typography.body },
  topActions: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing['2xl'], marginTop: spacing['2xl'] },
  rightActions: { flexDirection: 'row' },
  iconBtnGlass: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  iconBtnInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  editHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing['2xl'], marginTop: spacing['2xl'] },
  editTitle: { ...typography.title3, color: colors.textPrimary },
  header: { alignItems: 'center', marginBottom: spacing['3xl'] },
  amount: { ...typography.amount, fontSize: 44, color: colors.textPrimary, marginBottom: spacing.xs },
  merchant: { ...typography.title3, color: colors.textSecondary, marginBottom: 4 },
  date: { ...typography.caption1, color: colors.textMuted, marginBottom: spacing.sm },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.fill, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radius.full },
  aiBadgeText: { color: colors.textSecondary, ...typography.caption1, fontWeight: '600' },
  section: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.borderLight },
  label: { ...typography.caption2, color: colors.textMuted, marginBottom: 4, textTransform: 'uppercase', fontWeight: '600' },
  value: { ...typography.body, color: colors.textPrimary },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  itemName: { flex: 1, ...typography.subhead, color: colors.textPrimary },
  itemPrice: { ...typography.subhead, fontWeight: '500', color: colors.textPrimary },
  imageContainer: { position: 'relative', marginTop: spacing.sm },
  imageLoader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.fill, borderRadius: radius.md, zIndex: 1, height: 400 },
  receiptImage: { width: '100%', height: 400, borderRadius: radius.md, backgroundColor: colors.fill }
}));
