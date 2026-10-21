import React, { useRef, useState } from 'react';
import { Text, ScrollView, KeyboardAvoidingView, Platform, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { toast } from '../../lib/toast-store';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useChangePassword } from '../../features/auth/hooks/use-change-password';
import { changePasswordSchema } from '../../validation/auth';
import { makeStyles, spacing, typography } from '../../theme';

export default function ChangePasswordScreen() {
  const styles = useStyles();
  const router = useRouter();
  const changePassword = useChangePassword();
  const newRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    setErrors({});
    const parsed = changePasswordSchema.safeParse({ currentPassword, newPassword, confirmPassword });
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        if (e.path[0]) fieldErrors[e.path[0].toString()] = e.message;
      });
      setErrors(fieldErrors);
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success('Password updated');
          router.back();
        },
        onError: (err) => {
          if (err.message === 'Current password is incorrect') {
            setErrors({ currentPassword: err.message });
          } else {
            Alert.alert('Error', err.message);
          }
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.hint}>Use at least 8 characters. You will stay signed in on this device.</Text>

        <Input
          label="Current password"
          returnKeyType="next"
          onSubmitEditing={() => newRef.current?.focus()}
          secureTextEntry
          secureToggle
          autoCapitalize="none"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          error={errors.currentPassword}
        />
        <Input
          ref={newRef}
          label="New password"
          returnKeyType="next"
          onSubmitEditing={() => confirmRef.current?.focus()}
          secureTextEntry
          secureToggle
          autoCapitalize="none"
          value={newPassword}
          onChangeText={setNewPassword}
          error={errors.newPassword}
        />
        <Input
          ref={confirmRef}
          label="Confirm new password"
          returnKeyType="done"
          onSubmitEditing={handleSave}
          secureTextEntry
          secureToggle
          autoCapitalize="none"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={errors.confirmPassword}
        />

        <Button
          title="Update Password"
          onPress={handleSave}
          loading={changePassword.isPending}
          style={styles.button}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing['2xl'] },
  hint: { ...typography.subhead, color: colors.textSecondary, marginBottom: spacing['2xl'] },
  button: { marginTop: spacing.md },
}));
