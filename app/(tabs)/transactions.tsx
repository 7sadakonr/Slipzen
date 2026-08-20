import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenWrapper } from '../../components/layout/screen-wrapper';
import { TransactionList } from '../../features/transactions/components/transaction-list';
import { TransactionFilters } from '../../features/transactions/components/transaction-filters';
import { MonthPicker } from '../../components/ui/month-picker';
import { colors, spacing } from '../../theme';

export default function TransactionsScreen() {
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState(new Date());

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <MonthPicker currentDate={filterDate} onChange={setFilterDate} />
        </View>

        <TransactionFilters 
          search={search}
          onSearchChange={setSearch}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
        />
        
        <TransactionList filters={{ 
          search, 
          categoryId,
          year: filterDate.getFullYear(),
          month: filterDate.getMonth() 
        }} />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.md,
  }
});
