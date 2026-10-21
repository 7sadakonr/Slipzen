import React from 'react';
import { Text } from 'react-native';
import { Link } from 'expo-router';
import { RegisterForm } from '../../features/auth/components/register-form';
import { AuthShell } from '../../features/auth/components/auth-shell';
import { makeStyles, typography } from '../../theme';

export default function RegisterScreen() {
  const styles = useStyles();
  return (
    <AuthShell
      title="Create your account"
      subtitle="Scan receipts, set budgets, see where it goes."
      footer={
        <>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login" style={styles.link}>
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}

const useStyles = makeStyles((colors) => ({
  footerText: { ...typography.subhead, color: colors.textSecondary },
  link: { ...typography.subhead, color: colors.textPrimary, fontWeight: '700' },
}));
