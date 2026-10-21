import React from 'react';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { makeStyles, radius, spacing, typography, useTheme } from '../../theme';

const useStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: c.borderLight,
    padding: spacing.xl,
  },
  group: {
    backgroundColor: c.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: c.borderLight,
    overflow: 'hidden',
  },
  groupTitle: {
    ...typography.footnote,
    color: c.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: c.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowTitle: { ...typography.body, color: c.textPrimary },
  rowSubtitle: { ...typography.footnote, color: c.textSecondary, marginTop: 2 },
  rowValue: { ...typography.body, color: c.textSecondary },
  divider: {
    height: 1,
    backgroundColor: c.borderLight,
    marginLeft: spacing.lg,
  },
}));

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const styles = useStyles();
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ListGroup({
  title,
  children,
  style,
}: {
  title?: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const styles = useStyles();
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View style={style}>
      {title ? <Text style={styles.groupTitle}>{title}</Text> : null}
      <View style={styles.group}>
        {items.map((child, i) => (
          <View key={i}>
            {child}
            {i < items.length - 1 && <View style={styles.divider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

interface ListRowProps {
  title: string;
  subtitle?: string;
  value?: string;
  /** Ionicons name rendered in a rounded chip. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Custom leading element (overrides icon). */
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  chevron?: boolean;
  destructive?: boolean;
  onPress?: () => void;
}

export function ListRow({
  title,
  subtitle,
  value,
  icon,
  leading,
  trailing,
  chevron,
  destructive,
  onPress,
}: ListRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const tint = destructive ? colors.danger : colors.textPrimary;

  const content = (
    <>
      {leading ??
        (icon ? (
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={18} color={tint} />
          </View>
        ) : null)}
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, destructive && { color: colors.danger }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.rowSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      {trailing}
      {chevron ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
    </>
  );

  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.fill }]}
      accessibilityRole="button"
    >
      {content}
    </Pressable>
  );
}
