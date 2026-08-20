import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';

export function TransactionCard({ transaction, onPress }: any) {
  const router = useRouter();

  const categoryName = transaction.categories?.name || 'Uncategorized';
  const categoryIcon = transaction.categories?.icon || '📦';
  const date = format(new Date(transaction.transaction_date), 'dd MMM yyyy');
  const amount = parseFloat(transaction.amount).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress ? onPress() : router.push(`/expense/${transaction.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{categoryIcon}</Text>
      </View>
      
      <View style={styles.details}>
        <View style={styles.header}>
          <Text style={styles.merchant} numberOfLines={1}>
            {transaction.merchant}
          </Text>
          <Text style={styles.amount}>฿{amount}</Text>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.category}>{categoryName}</Text>
          <Text style={styles.date}>
            {transaction.source === 'receipt_ai' ? '✨ ' : '✏️ '}{date}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  details: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  merchant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  }
});
