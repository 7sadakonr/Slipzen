import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, RefreshControl } from 'react-native';
import { ScreenWrapper } from '../../components/layout/screen-wrapper';
import { useProfile } from '../../features/auth/hooks/use-profile';
import { useUpdateProfile } from '../../features/auth/hooks/use-update-profile';
import { Input, Button, AvatarPicker, Appbar, ActivityIndicator, Card, ListGroup, ListRow, BlurHeader } from '../../components/ui';
import { useAvatarActions } from '../../features/auth/hooks/use-avatar';
import { toast } from '../../lib/toast-store';
import { useDeleteAccount } from '../../features/auth/hooks/use-delete-account';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { spacing, typography, radius, makeStyles } from '../../theme';

const CURRENCIES = ['THB', 'USD', 'EUR', 'GBP', 'JPY'];

export default function ProfileScreen() {
  const styles = useStyles();
  const { data: profile, isLoading, refetch, isRefetching } = useProfile();
  const [headerH, setHeaderH] = useState(110);
  const avatar = useAvatarActions();
  const deleteAccount = useDeleteAccount();
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

  const dirty =
    displayName.trim() !== (profile?.display_name ?? '') || currency !== (profile?.currency ?? 'THB');

  const handleSave = () => {
    if (!displayName.trim()) return;
    
    updateProfile.mutate(
      { displayName: displayName.trim(), currency },
      {
        onSuccess: () => toast.success('Profile saved'),
        onError: (err) => Alert.alert('Error', err.message),
      }
    );
  };

  const handleLogout = async () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Sign out', 
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
        }
      }
    ]);
  };

  const handlePickAvatar = (source: 'camera' | 'library') => {
    avatar.change.mutate(source, { onError: (err) => Alert.alert('Photo', err.message) });
  };

  const handleRemoveAvatar = () => {
    avatar.remove.mutate(undefined, { onError: (err) => Alert.alert('Error', err.message) });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account, expenses, receipts, budgets and categories. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () =>
            Alert.alert('Are you absolutely sure?', 'All your data will be erased immediately.', [
              { text: 'Keep my account', style: 'cancel' },
              {
                text: 'Delete forever',
                style: 'destructive',
                onPress: () =>
                  deleteAccount.mutate(undefined, {
                    onError: (err) => Alert.alert('Could not delete account', err.message),
                  }),
              },
            ]),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ScreenWrapper>
        <BlurHeader><Appbar title="Profile" /></BlurHeader>
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <BlurHeader onHeight={setHeaderH}>
        <Appbar title="Profile" />
      </BlurHeader>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: headerH + spacing.md }]}
        scrollIndicatorInsets={{ top: headerH }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View style={styles.header}>
          <View style={{ marginBottom: spacing.lg }}>
            <AvatarPicker
              name={profile?.display_name || profile?.email}
              imageUri={profile?.avatar_url}
              size={96}
              busy={avatar.isBusy}
              onPick={handlePickAvatar}
              onRemove={handleRemoveAvatar}
            />
          </View>
          <Text style={styles.name}>{profile?.display_name || 'Your profile'}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>

        <Card style={styles.form}>
          <Input label="Display Name" value={displayName} onChangeText={setDisplayName} />

          <Text style={styles.label}>Default currency</Text>
          <Text style={styles.helper}>Used for new expenses you add or scan.</Text>
          <View style={styles.currencyRow}>
            {CURRENCIES.map((curr) => (
              <TouchableOpacity
                key={curr}
                style={[styles.currencyChip, currency === curr && styles.currencyChipActive]}
                onPress={() => setCurrency(curr)}
              >
                <Text style={[styles.currencyText, currency === curr && styles.currencyTextActive]}>{curr}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Save Changes"
            disabled={!dirty || !displayName.trim()}
            onPress={handleSave}
            loading={updateProfile.isPending}
            style={styles.saveButton}
          />
        </Card>

        <ListGroup title="Manage" style={styles.section}>
          <ListRow title="Categories" icon="pricetags-outline" chevron onPress={() => router.push('/categories')} />
          <ListRow title="Budgets" icon="wallet-outline" chevron onPress={() => router.push('/budget')} />
        </ListGroup>

        <ListGroup title="Account" style={styles.section}>
          <ListRow title="Change Password" icon="key-outline" chevron onPress={() => router.push('/account/password')} />
          <ListRow title="Sign out" icon="log-out-outline" onPress={handleLogout} />
          <ListRow
            title={deleteAccount.isPending ? 'Deleting…' : 'Delete Account'}
            icon="trash-outline"
            destructive
            onPress={deleteAccount.isPending ? undefined : handleDeleteAccount}
          />
        </ListGroup>
      </ScrollView>
    </ScreenWrapper>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { padding: spacing['2xl'], paddingBottom: 120 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: spacing['3xl'] },
  name: { ...typography.title2, color: colors.textPrimary },
  email: { ...typography.callout, color: colors.textSecondary, marginTop: 2 },
  form: { marginBottom: spacing['2xl'] },
  label: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  helper: { ...typography.footnote, color: colors.textMuted, marginTop: -4, marginBottom: spacing.md },
  currencyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  currencyChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.fill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  currencyChipActive: { backgroundColor: colors.primary },
  currencyText: { ...typography.subhead, color: colors.textSecondary, fontWeight: '600' },
  currencyTextActive: { color: colors.onPrimary },
  saveButton: { marginTop: spacing.xl },
  section: { marginBottom: spacing['2xl'] },
}));
