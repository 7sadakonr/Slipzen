import React from 'react';
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ViewStyle, 
  TextStyle,
  Platform,
  View,
  useColorScheme
} from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, typography, spacing, radius } from '../../theme';

// Safely import Expo UI SwiftUI bindings for iOS
let Host: any, SwiftUIButton: any, buttonStyle: any, foregroundStyle: any;
if (Platform.OS === 'ios') {
  try {
    const expoUi = require('@expo/ui/swift-ui');
    const modifiers = require('@expo/ui/swift-ui/modifiers');
    Host = expoUi.Host;
    SwiftUIButton = expoUi.Button;
    buttonStyle = modifiers.buttonStyle;
    foregroundStyle = modifiers.foregroundStyle;
  } catch (e) {
    console.warn('Expo UI SwiftUI not available', e);
  }
}

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const sizeStyles = getSizeStyles(size);

  // iOS Native Liquid Glass implementation
  if (Platform.OS === 'ios' && Host && SwiftUIButton && buttonStyle && foregroundStyle) {
    let modifier = buttonStyle('bordered');
    let fgModifier = foregroundStyle(colors.surface);
    const isDestructive = variant === 'danger';

    if (variant === 'primary') {
      modifier = buttonStyle('glassProminent');
      fgModifier = foregroundStyle(isDark ? '#ffffff' : '#ffffff');
    } else if (variant === 'secondary' || variant === 'outline') {
      modifier = buttonStyle('glass');
      fgModifier = foregroundStyle(isDark ? '#ffffff' : colors.primary);
    }

    const hostStyle: ViewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
      ...sizeStyles.container,
      ...style,
    };

    return (
      <Host matchContents style={hostStyle}>
        <SwiftUIButton
          label={title}
          onPress={onPress}
          disabled={disabled || loading}
          modifiers={[modifier]}
          // Destructive styling in iOS relies on role or tint, assuming standard SwiftUI button role or tint mapping
          role={isDestructive ? 'destructive' : undefined} 
        />
      </Host>
    );
  }



  // Fallback Implementation for Android / Unavailability
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          container: [styles.primaryContainer, disabled && styles.primaryDisabled],
          glass: [styles.primaryGlass, disabled && styles.glassDisabled],
          text: [styles.primaryText, disabled && styles.disabledText],
          tint: 'default' as const,
          intensity: 60,
        };
      case 'secondary':
        return {
          container: [styles.secondaryContainer, disabled && styles.secondaryDisabled],
          glass: [styles.secondaryGlass, disabled && styles.glassDisabled],
          // Ensure secondary text is visible on its glass background
          text: [{ color: isDark ? '#ffffff' : colors.primary }, disabled && styles.disabledText],
          tint: 'default' as const,
          intensity: 50,
        };
      case 'outline':
        return {
          container: [styles.outlineContainer, disabled && styles.outlineDisabled],
          glass: [styles.outlineGlass, disabled && styles.glassDisabled],
          text: [{ color: isDark ? '#ffffff' : colors.textPrimary }, disabled && styles.disabledText],
          tint: 'default' as const,
          intensity: 30,
        };
      case 'danger':
        return {
          container: [styles.dangerContainer, disabled && styles.dangerDisabled],
          glass: [styles.dangerGlass, disabled && styles.glassDisabled],
          text: [styles.dangerText, disabled && styles.disabledText],
          tint: 'default' as const,
          intensity: 60,
        };
      default:
        return {
          container: styles.primaryContainer,
          glass: styles.primaryGlass,
          text: styles.primaryText,
          tint: 'default' as const,
          intensity: 60,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.baseContainer,
        sizeStyles.container,
        variantStyles.container,
        style,
        // Remove opacity fade to avoid background bleed
      ]}
    >
      {({ pressed }) => (
        <>
          <BlurView
            intensity={variantStyles.intensity}
            tint={variantStyles.tint}
            style={[
              StyleSheet.absoluteFill, 
              variantStyles.glass,
            ]}
          />
          {pressed && (
            <View 
              style={[
                StyleSheet.absoluteFill, 
                { backgroundColor: variant === 'secondary' || variant === 'outline' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)' }
              ]} 
            />
          )}
          
          <View style={[styles.contentRow]}>
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
          </View>
        </>
      )}
    </Pressable>
  );
}

// Helpers
function getSizeStyles(size: string) {
  switch (size) {
    case 'sm':
      return { container: styles.smContainer, text: styles.smText };
    case 'lg':
      return { container: styles.lgContainer, text: styles.lgText };
    case 'md':
    default:
      return { container: styles.mdContainer, text: styles.mdText };
  }
}

const styles = StyleSheet.create({
  baseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    zIndex: 1,
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
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      }
    })
  },
  primaryGlass: {
    backgroundColor: 'rgba(119, 122, 255, 0.9)',
  },
  primaryText: {
    color: colors.surface,
  },
  primaryDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowOpacity: 0,
  },

  // Secondary Variant
  secondaryContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  secondaryGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  secondaryText: {
    color: colors.primary,
  },
  secondaryDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Outline Variant
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(119, 122, 255, 0.5)',
  },
  outlineGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  outlineText: {
    color: colors.textPrimary,
  },
  outlineDisabled: {
    borderColor: colors.borderLight,
  },

  // Danger Variant
  dangerContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dangerGlass: {
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
  },
  dangerText: {
    color: colors.surface,
  },
  dangerDisabled: {
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },

  // Shared Disabled Glass
  glassDisabled: {
    backgroundColor: 'rgba(150, 150, 150, 0.15)',
  },
  disabledText: {
    color: colors.textMuted,
  },
});
