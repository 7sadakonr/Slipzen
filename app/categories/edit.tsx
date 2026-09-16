import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useCategories } from '../../features/categories/hooks/use-categories';
import { useCreateCategory } from '../../features/categories/hooks/use-create-category';
import { useUpdateCategory } from '../../features/categories/hooks/use-update-category';
import { useDeleteCategory } from '../../features/categories/hooks/use-delete-category';
import { useMergeCategory } from '../../features/categories/hooks/use-merge-category';
import { colors, spacing, typography, radius, shadows } from '../../theme';

export default function EditCategoryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { data: categories } = useCategories();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();
  const mergeCat = useMergeCategory();
  
  const isEditing = !!id;
  const existingCategory = isEditing ? categories?.find(c => c.id === id) : null;
  const txCount = existingCategory?.transactions?.[0]?.count || 0;

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏷️');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (existingCategory) {
      setName(existingCategory.name);
      setIcon(existingCategory.icon || '🏷️');
    }
  }, [existingCategory]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    if (!icon.trim()) {
      Alert.alert('Error', 'Icon is required');
      return;
    }

    if (isEditing) {
      updateCat.mutate(
        { id: id!, name: name.trim(), icon: icon.trim() },
        {
          onSuccess: () => router.back(),
          onError: (err) => Alert.alert('Error', err.message)
        }
      );
    } else {
      createCat.mutate(
        { name: name.trim(), icon: icon.trim() },
        {
          onSuccess: () => router.back(),
          onError: (err) => Alert.alert('Error', err.message)
        }
      );
    }
  };

  const handleDelete = () => {
    if (txCount > 0) {
      setShowReassignModal(true);
      return;
    }

    Alert.alert('Delete Category', 'Are you sure you want to delete this category?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: () => {
          deleteCat.mutate({ id: id! }, {
            onSuccess: () => router.back(),
            onError: (err) => Alert.alert('Error', err.message)
          });
        }
      }
    ]);
  };

  const handleMerge = () => {
    if (!targetCategoryId) {
      Alert.alert('Error', 'Please select a target category');
      return;
    }
    
    Alert.alert(
      'Merge Category', 
      'All transactions and budgets will be moved to the new category. This category will be deleted. This cannot be undone.', 
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Merge & Delete', 
          style: 'destructive',
          onPress: () => {
            mergeCat.mutate(
              { sourceCategoryId: id!, targetCategoryId },
              {
                onSuccess: () => {
                  setShowReassignModal(false);
                  router.back();
                },
                onError: (err) => Alert.alert('Error', err.message)
              }
            );
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Input 
            label="Icon (Emoji)"
            value={icon}
            onChangeText={setIcon}
            maxLength={2}
          />
          <Input 
            label="Category Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Coffee"
          />
          
          <Button 
            title={isEditing ? "Save Changes" : "Create Category"}
            onPress={handleSave}
            loading={createCat.isPending || updateCat.isPending}
            style={styles.saveButton}
          />
        </View>

        {isEditing && (
          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <Text style={styles.dangerText}>
              This category has {txCount} {txCount === 1 ? 'transaction' : 'transactions'}. 
              {txCount > 0 && ' You must reassign them to another category before deleting.'}
            </Text>
            <Button 
              title={txCount > 0 ? "Reassign & Delete" : "Delete Category"}
              variant="danger"
              onPress={handleDelete}
              loading={deleteCat.isPending}
              style={styles.deleteButton}
            />
          </View>
        )}
      </ScrollView>

      {/* Reassign Modal */}
      <Modal visible={showReassignModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reassign Transactions</Text>
            <Text style={styles.modalText}>
              Select a category to receive all {txCount} transactions from "{existingCategory?.name}".
            </Text>
            
            <ScrollView style={styles.categoryList}>
              {categories?.filter(c => c.id !== id).map(c => (
                <TouchableOpacity 
                  key={c.id}
                  style={[
                    styles.categoryItem,
                    targetCategoryId === c.id && styles.categoryItemActive
                  ]}
                  onPress={() => setTargetCategoryId(c.id)}
                >
                  <Text style={styles.categoryItemIcon}>{c.icon}</Text>
                  <Text style={[
                    styles.categoryItemText,
                    targetCategoryId === c.id && styles.categoryItemTextActive
                  ]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <Button 
                title="Cancel" 
                variant="outline" 
                onPress={() => setShowReassignModal(false)} 
                style={styles.modalBtn}
              />
              <Button 
                title="Confirm" 
                variant="danger" 
                onPress={handleMerge} 
                loading={mergeCat.isPending}
                style={styles.modalBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  card: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...shadows.sm, marginBottom: spacing['2xl'] },
  saveButton: { marginTop: spacing.md },
  dangerZone: { backgroundColor: '#FF3B3015', padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: '#FF3B3030' },
  dangerTitle: { ...typography.title3, color: colors.danger, marginBottom: spacing.sm },
  dangerText: { ...typography.subhead, color: colors.textSecondary, marginBottom: spacing.lg },
  deleteButton: { },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, maxHeight: '80%' },
  modalTitle: { ...typography.title2, color: colors.textPrimary, marginBottom: spacing.sm },
  modalText: { ...typography.callout, color: colors.textSecondary, marginBottom: spacing.lg },
  categoryList: { maxHeight: 300, marginBottom: spacing.xl },
  categoryItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  categoryItemActive: { backgroundColor: colors.primarySoft },
  categoryItemIcon: { fontSize: 24, marginRight: spacing.md },
  categoryItemText: { ...typography.body, color: colors.textPrimary },
  categoryItemTextActive: { color: colors.primary, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: spacing.md },
  modalBtn: { flex: 1 },
});
