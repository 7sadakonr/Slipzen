import React, { useState } from 'react';
import { View } from 'react-native';
import { ScreenWrapper } from '../../components/layout/screen-wrapper';
import { TransactionList } from '../../features/transactions/components/transaction-list';
import { TransactionFilters } from '../../features/transactions/components/transaction-filters';
import { MonthPicker, Appbar, BlurHeader } from '../../components/ui';
import { spacing, makeStyles } from '../../theme';

export default function TransactionsScreen() {
  const styles = useStyles();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [filterDate, setFilterDate] = useState(new Date());
  const [headerH, setHeaderH] = useState(260);

  return (
    <ScreenWrapper>
      <BlurHeader onHeight={setHeaderH}>
        <Appbar title="History" />
        <View style={styles.header}>
          <MonthPicker currentDate={filterDate} onChange={setFilterDate} />
        </View>
        <TransactionFilters
          search={search}
          onSearchChange={setSearch}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
        />
      </BlurHeader>
      <View style={styles.container}>
        <TransactionList topInset={headerH} filters={{ 
          search, 
          categoryId,
          year: filterDate.getFullYear(),
          month: filterDate.getMonth() 
        }} />
      </View>
    </ScreenWrapper>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.xs,
  }
}));
