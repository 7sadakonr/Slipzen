import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { ScreenWrapper } from '../../components/layout/screen-wrapper';
import { useProfile } from '../../features/auth/hooks/use-profile';
import { useUpdateProfile } from '../../features/auth/hooks/use-update-profile';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, radius, shadows } from '../../theme';

const CURRENCIES = ['THB', 'USD', 'EUR', 'GBP', 'JPY'];

export default function ProfileScreen() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const router = useRouter();
  
  const [displayName, setDisplayName] = useState('');
  const [currency, setCurrency] = useState('THB');

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    }
    if (profile?.currency) {
      setCurrency(profile.currency);
    }
  }, [profile]);

  const handleSave = () => {
    if (!displayName.trim()) return;
    
    updateProfile.mutate(
      { displayName: displayName.trim(), currency },
      {
        onSuccess: () => Alert.alert('Success', 'Profile updated successfully'),
        onError: (err) => Alert.alert('Error', err.message),
      }
    );
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        }
      }
    ]);
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView 
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.display_name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>

        <View style={styles.form}>
          <Input 
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
          />

          <View style={styles.currencySection}>
            <Text style={styles.label}>Default Currency (For new expenses)</Text>
            <View style={styles.currencyRow}>
              {CURRENCIES.map(curr => (
                <TouchableOpacity
                  key={curr}
                  style={[
                    styles.currencyChip,
                    currency === curr && styles.currencyChipActive
                  ]}
                  onPress={() => setCurrency(curr)}
                >
                  <Text style={[
                    styles.currencyText,
                    currency === curr && styles.currencyTextActive
                  ]}>
                    {curr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button 
            title="Save Changes" 
            onPress={handleSave}
            loading={updateProfile.isPending}
            style={styles.saveButton}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manage</Text>
          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => router.push('/categories')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>🏷️</Text>
              <Text style={styles.menuItemText}>Categories</Text>
            </View>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, { marginTop: spacing.sm }]} 
            onPress={() => router.push('/budget')}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>💰</Text>
              <Text style={styles.menuItemText}>Budgets</Text>
            </View>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dangerZone}>
          <Button 
            title="Log Out" 
            variant="danger"
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing['2xl'] },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: spacing['3xl'] },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.lg, ...shadows.md },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: 'bold' },
  email: { ...typography.callout, color: colors.textSecondary },
  form: { backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, marginBottom: spacing['2xl'], ...shadows.sm },
  currencySection: { marginBottom: spacing.lg, marginTop: spacing.sm },
  label: { ...typography.subhead, color: colors.textPrimary, marginBottom: spacing.sm, fontWeight: '500' },
  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  currencyChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderLight },
  currencyChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  currencyText: { ...typography.subhead, color: colors.textSecondary, fontWeight: '500' },
  currencyTextActive: { color: colors.primary },
  saveButton: { marginTop: spacing.lg },
  section: { marginBottom: spacing['3xl'] },
  sectionTitle: { ...typography.title3, color: colors.textPrimary, marginBottom: spacing.lg },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: spacing.lg, borderRadius: radius.lg, ...shadows.sm },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  menuItemIcon: { fontSize: 24 },
  menuItemText: { ...typography.body, color: colors.textPrimary, fontWeight: '500' },
  menuItemArrow: { fontSize: 20, color: colors.textMuted },
  dangerZone: { marginTop: spacing['2xl'] }
});
