import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SlipzenLogo } from '../../../components/ui/slipzen-logo';
import { GraphiteCard } from '../../../components/ui/graphite-card';
import { ScreenGradient } from '../../../components/ui/screen-gradient';
import { makeStyles, spacing, typography, useTheme } from '../../../theme';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/** Shared frame for sign in / sign up: Slipzen logo, headline, form and a switch-screen footer. */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScreenGradient />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <GraphiteCard style={styles.brand} padding={spacing['2xl']}>
          <SlipzenLogo width={140} height={42} color="#FFFFFF" />
          <Text style={styles.brandTag}>Spend smarter. Know where it goes.</Text>
        </GraphiteCard>

        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {children}

        <View style={styles.footer}>{footer}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing['4xl'],
  },
  brand: { marginBottom: spacing['3xl'] },
  brandTag: { ...typography.footnote, color: 'rgba(255,255,255,0.65)', marginTop: spacing.sm },
  header: { marginBottom: spacing['3xl'] },
  title: { ...typography.largeTitle, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing['2xl'] },
}));
