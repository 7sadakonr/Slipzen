import React from 'react';
import { Text } from 'react-native';
import { Link } from 'expo-router';
import { LoginForm } from '../../features/auth/components/login-form';
import { AuthShell } from '../../features/auth/components/auth-shell';
import { makeStyles, typography } from '../../theme';

export default function LoginScreen() {
  const styles = useStyles();
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to Slipzen to track your spending."
      footer={
        <>
          <Text style={styles.footerText}>New to Slipzen? </Text>
          <Link href="/register" style={styles.link}>
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}

const useStyles = makeStyles((colors) => ({
  footerText: { ...typography.subhead, color: colors.textSecondary },
  link: { ...typography.subhead, color: colors.textPrimary, fontWeight: '700' },
}));
