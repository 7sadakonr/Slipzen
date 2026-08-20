import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useCategories } from '../hooks/use-categories';
import { colors, spacing, typography, radius } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

interface CategoryPickerProps {
  value: string | null;
  onChange: (id: string) => void;
  error?: string;
}

export function CategoryPicker({ value, onChange, error }: CategoryPickerProps) {
  const { data: categories, isLoading } = useCategories();
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedCategory = categories?.find(c => c.id === value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category</Text>
      
      <TouchableOpacity 
        style={[styles.pickerButton, error && styles.pickerError]}
        onPress={() => setIsOpen(true)}
      >
        <Text style={selectedCategory ? styles.selectedText : styles.placeholderText}>
          {isLoading ? 'Loading...' : selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : 'Select a category'}
        </Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <Ionicons name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.categoryItem}
                onPress={() => {
                  onChange(item.id);
                  setIsOpen(false);
                }}
              >
                <View style={styles.iconContainer}>
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.categoryName}>{item.name}</Text>
                {item.id === value && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption2,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    height: 48,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  pickerError: {
    borderColor: colors.danger,
  },
  placeholderText: {
    ...typography.body,
    color: colors.textMuted,
  },
  selectedText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  errorText: {
    ...typography.caption1,
    color: colors.danger,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    ...typography.title3,
    color: colors.textPrimary,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    ...typography.body,
    color: colors.textPrimary,
  }
});
