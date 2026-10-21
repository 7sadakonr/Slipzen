import React from 'react';
import { ActionSheetIOS, ActivityIndicator, Alert, Platform, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Avatar } from './avatar';
import { Glass } from './glass';
import { makeStyles, useTheme } from '../../theme';
import type { AvatarSource } from '../../features/auth/hooks/use-avatar';

interface AvatarPickerProps {
  name?: string;
  imageUri?: string | null;
  size?: number;
  busy?: boolean;
  onPick: (source: AvatarSource) => void;
  /** When provided, a "Remove photo" option is shown while an image is set. */
  onRemove?: () => void;
}

/** Tap-to-edit profile picture with a camera badge and a native action sheet. */
export function AvatarPicker({ name, imageUri, size = 96, busy, onPick, onRemove }: AvatarPickerProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  const open = () => {
    Haptics.selectionAsync().catch(() => {});
    const canRemove = !!imageUri && !!onRemove;
    const labels = ['Take Photo', 'Choose from Library', ...(canRemove ? ['Remove Photo'] : []), 'Cancel'];

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: labels,
          cancelButtonIndex: labels.length - 1,
          destructiveButtonIndex: canRemove ? 2 : undefined,
        },
        (i) => {
          if (i === 0) onPick('camera');
          else if (i === 1) onPick('library');
          else if (canRemove && i === 2) onRemove?.();
        }
      );
    } else {
      Alert.alert('Profile picture', undefined, [
        { text: 'Take Photo', onPress: () => onPick('camera') },
        { text: 'Choose from Library', onPress: () => onPick('library') },
        ...(canRemove ? [{ text: 'Remove Photo', style: 'destructive' as const, onPress: onRemove }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ]);
    }
  };

  return (
    <Pressable
      onPress={open}
      disabled={busy}
      accessibilityRole="button"
      accessibilityLabel="Change profile picture"
      style={{ width: size, height: size }}
    >
      <Avatar name={name} imageUri={imageUri || undefined} size={size} />
      {busy && (
        <View style={[styles.overlay, { borderRadius: size / 2 }]}>
          <ActivityIndicator color="#FFFFFF" />
        </View>
      )}
      <Glass isInteractive style={styles.badge}>
        <Ionicons name="camera" size={16} color={colors.textPrimary} />
      </Glass>
    </Pressable>
  );
}

const useStyles = makeStyles(() => ({
  overlay: {
    ...({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const),
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
}));
