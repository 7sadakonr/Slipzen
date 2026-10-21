import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shadows, makeStyles, useTheme } from '../../theme';

interface FABProps {
  onPress: () => void;
}

export function FAB({ onPress }: FABProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={32} color={colors.surface} />
    </TouchableOpacity>
  );
}

const useStyles = makeStyles((colors) => ({
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80, // rough height of tab bar + safe area
    alignSelf: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.fab,
    zIndex: 999,
  }
}));
