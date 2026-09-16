import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Alert } from 'react-native';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { Swipeable, TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useDeleteTransaction } from '../hooks/use-delete-transaction';
import { colors } from '../../../theme';

export function TransactionCard({ transaction, onPress }: any) {
  const router = useRouter();
  const deleteMutation = useDeleteTransaction();
  const swipeableRef = useRef<Swipeable>(null);

  const categoryName = transaction.categories?.name || 'Uncategorized';
  const categoryIcon = transaction.categories?.icon || '📦';
  const date = format(new Date(transaction.transaction_date), 'dd MMM yyyy');
  const amount = parseFloat(transaction.amount).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleDelete = () => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { 
        text: 'Cancel', 
        style: 'cancel',
        onPress: () => swipeableRef.current?.close()
      },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => {
          deleteMutation.mutate({ id: transaction.id, receiptPath: transaction.receipt_path });
        }
      }
    ]);
  };

  const renderRightActions = (progress: any, dragX: any) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={handleDelete}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.swipeWrapper}>
      <Swipeable 
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        friction={2}
        rightThreshold={40}
        containerStyle={styles.swipeableContainer}
      >
        <TouchableOpacity 
          style={styles.card} 
          onPress={() => onPress ? onPress() : router.push(`/expense/${transaction.id}`)}
          activeOpacity={1} // use GH touchable opacity which is better
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
      </Swipeable>
    </View>
  );
}

const styles = StyleSheet.create({
  swipeWrapper: {
    backgroundColor: colors.danger, // This prevents the transparent background when swiping
  },
  swipeableContainer: {
    marginBottom: 0,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
    alignItems: 'center',
  },
  deleteAction: {
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
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
