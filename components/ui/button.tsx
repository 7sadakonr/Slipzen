import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  Platform 
} from 'react-native';
import { colors, typography, spacing, radius } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  // Determine styles based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: [styles.primaryContainer, disabled && styles.primaryDisabled],
          text: [styles.primaryText, disabled && styles.disabledText],
        };
      case 'secondary':
        return {
          container: [styles.secondaryContainer, disabled && styles.secondaryDisabled],
          text: [styles.secondaryText, disabled && styles.disabledText],
        };
      case 'outline':
        return {
          container: [styles.outlineContainer, disabled && styles.outlineDisabled],
          text: [styles.outlineText, disabled && styles.disabledText],
        };
      case 'danger':
        return {
          container: [styles.dangerContainer, disabled && styles.dangerDisabled],
          text: [styles.dangerText, disabled && styles.disabledText],
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  // Determine styles based on size
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { container: styles.smContainer, text: styles.smText };
      case 'lg':
        return { container: styles.lgContainer, text: styles.lgText };
      case 'md':
      default:
        return { container: styles.mdContainer, text: styles.mdText };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.baseContainer,
        sizeStyles.container,
        variantStyles.container,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' || variant === 'danger' ? colors.surface : colors.primary} 
          size="small" 
        />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          <Text style={[styles.baseText, sizeStyles.text, variantStyles.text, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  baseText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Sizes
  smContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  mdContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  lgContainer: {
    paddingVertical: 18,
    paddingHorizontal: spacing['2xl'],
  },
  smText: {
    fontSize: typography.subhead.fontSize,
  },
  mdText: {
    fontSize: typography.body.fontSize,
  },
  lgText: {
    fontSize: typography.title3.fontSize,
  },

  // Primary Variant
  primaryContainer: {
    backgroundColor: colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      }
    })
  },
  primaryText: {
    color: colors.surface,
  },
  primaryDisabled: {
    backgroundColor: colors.primaryMuted,
  },

  // Secondary Variant
  secondaryContainer: {
    backgroundColor: colors.primarySoft,
  },
  secondaryText: {
    color: colors.primary,
  },
  secondaryDisabled: {
    backgroundColor: colors.borderLight,
  },

  // Outline Variant
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  outlineText: {
    color: colors.textPrimary,
  },
  outlineDisabled: {
    borderColor: colors.borderLight,
  },

  // Danger Variant
  dangerContainer: {
    backgroundColor: colors.danger,
  },
  dangerText: {
    color: colors.surface,
  },
  dangerDisabled: {
    backgroundColor: colors.borderLight,
  },

  // Shared Disabled
  disabledText: {
    color: colors.textMuted,
  },
});
