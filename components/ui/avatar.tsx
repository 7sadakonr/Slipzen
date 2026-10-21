import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacity,
} from 'react-native';
import { shadows, makeStyles, useTheme } from '../../theme';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /** User name used for extracting initials */
  name?: string;
  /** Remote or local image URI */
  imageUri?: string;
  /** Size preset ('sm' | 'md' | 'lg' | 'xl') or exact numeric diameter */
  size?: AvatarSize | number;
  /** Custom background color for initials avatar */
  backgroundColor?: string;
  /** Custom text color for initials */
  textColor?: string;
  /** Optional press handler */
  onPress?: () => void;
  /** Extra container styles */
  style?: StyleProp<ViewStyle>;
  /** Extra text styles for initials */
  textStyle?: StyleProp<TextStyle>;
}

const PRESET_SIZES: Record<AvatarSize, { container: number; fontSize: number }> = {
  sm: { container: 32, fontSize: 13 },
  md: { container: 44, fontSize: 18 },
  lg: { container: 64, fontSize: 26 },
  xl: { container: 80, fontSize: 32 },
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const clean = name.trim();
  if (!clean) return '?';
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  name,
  imageUri,
  size = 'md',
  backgroundColor,
  textColor,
  onPress,
  style,
  textStyle,
}: AvatarProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { diameter, fontSize } = React.useMemo(() => {
    if (typeof size === 'number') {
      return { diameter: size, fontSize: Math.round(size * 0.4) };
    }
    const preset = PRESET_SIZES[size] || PRESET_SIZES.md;
    return { diameter: preset.container, fontSize: preset.fontSize };
  }, [size]);

  const initials = getInitials(name);

  const containerDimensionStyle: ViewStyle = {
    width: diameter,
    height: diameter,
    borderRadius: diameter / 2,
  };

  const content = imageUri ? (
    <View
      style={[
        styles.imageWrapper,
        containerDimensionStyle,
        style,
      ]}
    >
      <Image
        source={{ uri: imageUri }}
        style={styles.imageFill}
      />
    </View>
  ) : (
    <View
      style={[
        styles.initialsContainer,
        containerDimensionStyle,
        { backgroundColor: backgroundColor ?? colors.primary },
        shadows.sm,
        style,
      ]}
    >
      <Text
        style={[
          styles.initialsText,
          { fontSize, color: textColor ?? colors.onPrimary },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {initials}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={containerDimensionStyle}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

export default Avatar;

const useStyles = makeStyles((colors) => ({
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  imageWrapper: {
    overflow: 'hidden',
  },
  imageFill: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  initialsText: {
    fontWeight: '700',
    textAlign: 'center',
  },
}));
