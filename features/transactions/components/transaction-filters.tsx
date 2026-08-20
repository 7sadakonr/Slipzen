import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryPicker } from '../../categories/components/category-picker';
import { colors, spacing, radius, typography } from '../../../theme';

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  categoryId: string | null;
  onCategoryChange: (id: string | null) => void;
}

export function TransactionFilters({
  search, onSearchChange, categoryId, onCategoryChange
}: TransactionFiltersProps) {
  
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
          placeholder="Search merchant..."
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
          <Ionicons 
            name="close-circle" 
            size={24} 
            color={colors.danger} 
            style={styles.clearCategory}
            onPress={() => onCategoryChange(null)} 
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 40,
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
  clearCategory: {
    marginLeft: spacing.sm,
  }
});
