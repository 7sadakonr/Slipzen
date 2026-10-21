import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { makeStyles, typography, spacing, useTheme } from '../../theme';
import { Glass } from './glass';

export interface AppbarAction {
  /** Icon name from Ionicons */
  icon: keyof typeof Ionicons.glyphMap;
  /** Action click callback */
  onPress: () => void;
  /** Optional badge or indicator rendered over the action */
  badge?: React.ReactNode;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
}

export interface AppbarProps {
  /** Header title text or custom title component (e.g. Logo) */
  title?: React.ReactNode;
  /** Optional secondary subtitle */
  subtitle?: string;
  /** Whether to show back navigation button */
  showBack?: boolean;
  /** Custom handler when back button is pressed (defaults to router.back()) */
  onBack?: () => void;
  /** Custom element on left side (overrides back button) */
  leading?: React.ReactNode;
  /** Custom element on right side (overrides actions list) */
  trailing?: React.ReactNode;
  /** Quick action icons to render on right side */
  actions?: AppbarAction[];
  /** Whether to show a bottom border divider */
  bordered?: boolean;
  /** Custom container style */
  style?: StyleProp<ViewStyle>;
  /** Custom title text style */
  titleStyle?: StyleProp<TextStyle>;
  /** Center the title (iOS style, defaults to true) */
  centerTitle?: boolean;
}

export function Appbar({
  title,
  subtitle,
  showBack = false,
  onBack,
  leading,
  trailing,
  actions,
  bordered = false,
  style,
  titleStyle,
  centerTitle = false,
}: AppbarProps) {
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const renderLeading = () => {
    if (leading) return leading;
    if (showBack) {
      return (
        <TouchableOpacity
          onPress={handleBack}
          style={styles.glassBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Glass isInteractive style={styles.glassCircle}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Glass>
        </TouchableOpacity>
      );
    }
    return null;
  };

  const renderTrailing = () => {
    if (trailing) return trailing;
    if (actions && actions.length > 0) {
      return (
        <View style={styles.actionsRow}>
          {actions.map((action, index) => (
            <View key={index} style={styles.actionItemWrapper}>
              <TouchableOpacity
                onPress={action.onPress}
                style={styles.glassBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="button"
                accessibilityLabel={action.accessibilityLabel}
              >
                <Glass isInteractive style={styles.glassCircle}>
                  <Ionicons name={action.icon} size={20} color={colors.textPrimary} />
                </Glass>
              </TouchableOpacity>
              {action.badge ? (
                <View style={styles.actionBadgeAnchor}>{action.badge}</View>
              ) : null}
            </View>
          ))}
        </View>
      );
    }
    return null;
  };

  return (
    <View
      style={[
        styles.container,
        bordered && styles.bordered,
        style,
      ]}
    >
      <View style={styles.leadingContainer}>{renderLeading()}</View>

      <View
        style={[
          styles.titleContainer,
          centerTitle ? styles.titleCentered : styles.titleLeft,
        ]}
      >
        {title ? (
          typeof title === 'string' ? (
            <Text
              style={[styles.title, titleStyle]}
              numberOfLines={1}
            >
              {title}
            </Text>
          ) : (
            title
          )
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.trailingContainer}>{renderTrailing()}</View>
    </View>
  );
}

export default Appbar;

const useStyles = makeStyles((colors) => ({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: 'transparent',
  },
  bordered: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  leadingContainer: {
    minWidth: 0,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  titleCentered: {
    alignItems: 'center',
  },
  titleLeft: {
    alignItems: 'flex-start',
  },
  title: {
    ...typography.title1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption2,
    color: colors.textSecondary,
    marginTop: 1,
  },
  trailingContainer: {
    minWidth: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
    zIndex: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionItemWrapper: {
    position: 'relative',
  },
  actionBadgeAnchor: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  glassBtn: { justifyContent: 'center', alignItems: 'center' },
  glassCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconBtn: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
