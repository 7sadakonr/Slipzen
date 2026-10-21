import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryPicker } from '../../categories/components/category-picker';
import { spacing, radius, typography, makeStyles, useTheme } from '../../../theme';

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  categoryId: string | null;
  onCategoryChange: (id: string | null) => void;
}

export function TransactionFilters({
  search, onSearchChange, categoryId, onCategoryChange
}: TransactionFiltersProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  
  const [localSearch, setLocalSearch] = useState(search);

  // Sync prop changes back to local (e.g. if cleared from parent)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const handleClear = () => {
    setLocalSearch('');
    onSearchChange('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search merchant"
          value={localSearch}
          onChangeText={setLocalSearch}
          placeholderTextColor={colors.textMuted}
        />
        {localSearch.length > 0 && (
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={colors.textMuted} 
            onPress={handleClear} 
          />
        )}
      </View>
      <View style={styles.categoryWrap}>
        <CategoryPicker 
          value={categoryId} 
          onChange={onCategoryChange} 
        />
        {categoryId && (
          <TouchableOpacity
            style={styles.clearChip}
            onPress={() => onCategoryChange(null)}
            accessibilityRole="button"
            accessibilityLabel="Clear category filter"
          >
            <Text style={styles.clearChipText}>Clear</Text>
            <Ionicons name="close" size={14} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.fill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
  },
  categoryWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.fill,
  },
  clearChipText: {
    ...typography.footnote,
    fontWeight: '600',
    color: colors.textPrimary,
  }
}));
