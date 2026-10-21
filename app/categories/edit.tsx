import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '../../components/ui/input';
import { EmojiGrid } from '../../components/ui/emoji-grid';
import { toast } from '../../lib/toast-store';
import { Button } from '../../components/ui/button';
import { useCategories } from '../../features/categories/hooks/use-categories';
import { useCreateCategory } from '../../features/categories/hooks/use-create-category';
import { useUpdateCategory } from '../../features/categories/hooks/use-update-category';
import { useDeleteCategory } from '../../features/categories/hooks/use-delete-category';
import { useMergeCategory } from '../../features/categories/hooks/use-merge-category';
import { spacing, typography, radius, makeStyles, useTheme } from '../../theme';

export default function EditCategoryScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
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
          onSuccess: () => { toast.success('Category updated'); router.back(); },
          onError: (err) => Alert.alert('Error', err.message)
        }
      );
    } else {
      createCat.mutate(
        { name: name.trim(), icon: icon.trim() },
        {
          onSuccess: () => { toast.success('Category created'); router.back(); },
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Input 
            label="Category name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Coffee"
            returnKeyType="done"
            autoFocus={!isEditing}
          />
          <EmojiGrid label="Icon" value={icon} onChange={setIcon} />
          
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
              {txCount > 0
                ? `${txCount} ${txCount === 1 ? 'expense uses' : 'expenses use'} this category. Choose another category to move them to, then this one is deleted.`
                : 'No expenses use this category. It will be deleted permanently.'}
            </Text>
            <Button 
              title={txCount > 0 ? "Move expenses & delete" : "Delete category"}
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
            <Text style={styles.modalTitle}>Move expenses to…</Text>
            <Text style={styles.modalText}>
              {txCount} {txCount === 1 ? 'expense' : 'expenses'} from “{existingCategory?.name}” will move to the category you pick. Budgets for “{existingCategory?.name}” move too, and the category is deleted.
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
                    targetCategoryId === c.id && styles.categoryItemTextActive,
                    { flex: 1 }
                  ]}>
                    {c.name}
                  </Text>
                  <Ionicons
                    name={targetCategoryId === c.id ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={targetCategoryId === c.id ? colors.textPrimary : colors.textMuted}
                  />
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
                title="Move & delete" 
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

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg },
  card: { backgroundColor: colors.surface, padding: spacing.xl, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.borderLight, marginBottom: spacing['2xl'] },
  saveButton: { marginTop: spacing.md },
  dangerZone: { backgroundColor: colors.surface, padding: spacing.xl, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.danger },
  dangerTitle: { ...typography.title3, color: colors.danger, marginBottom: spacing.sm },
  dangerText: { ...typography.subhead, color: colors.textSecondary, marginBottom: spacing.lg },
  deleteButton: { },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing.xl, maxHeight: '80%' },
  modalTitle: { ...typography.title2, color: colors.textPrimary, marginBottom: spacing.sm },
  modalText: { ...typography.callout, color: colors.textSecondary, marginBottom: spacing.lg },
  categoryList: { maxHeight: 300, marginBottom: spacing.xl },
  categoryItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  categoryItemActive: { backgroundColor: colors.fill },
  categoryItemIcon: { fontSize: 24, marginRight: spacing.md },
  categoryItemText: { ...typography.body, color: colors.textPrimary },
  categoryItemTextActive: { color: colors.textPrimary, fontWeight: '700' },
  modalActions: { flexDirection: 'row', gap: spacing.md },
  modalBtn: { flex: 1 },
}));
