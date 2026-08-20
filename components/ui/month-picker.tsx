import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../theme';
import { format, subMonths, addMonths } from 'date-fns';

import { useAvailableMonths } from '../../features/transactions/hooks/use-available-months';
import { startOfMonth } from 'date-fns';

interface MonthPickerProps {
  currentDate: Date;
  onChange: (date: Date) => void;
}

export function MonthPicker({ currentDate, onChange }: MonthPickerProps) {
  const { data: availableMonths = [] } = useAvailableMonths();

  const currentMonthStart = startOfMonth(currentDate).getTime();
  
  // availableMonths is sorted newest first (descending)
  const currentIndex = availableMonths.findIndex(d => d.getTime() === currentMonthStart);
  
  // "Prev" means going back in time (older), which means moving to a HIGHER index in the descending array
  const canGoPrev = currentIndex >= 0 && currentIndex < availableMonths.length - 1;
  // "Next" means going forward in time (newer), which means moving to a LOWER index in the descending array
  const canGoNext = currentIndex > 0;

  const handlePrev = () => {
    if (!canGoPrev) return;
    onChange(availableMonths[currentIndex + 1]);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    onChange(availableMonths[currentIndex - 1]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePrev} style={[styles.button, !canGoPrev && { opacity: 0.3 }]} disabled={!canGoPrev}>
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
      </TouchableOpacity>
      
      <View style={styles.dateDisplay}>
        <Text style={styles.monthText}>{format(currentDate, 'MMMM')}</Text>
        <Text style={styles.yearText}>{format(currentDate, 'yyyy')}</Text>
      </View>
      
      <TouchableOpacity onPress={handleNext} style={[styles.button, !canGoNext && { opacity: 0.3 }]} disabled={!canGoNext}>
        <Ionicons name="chevron-forward" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
    alignSelf: 'center',
    width: 220,
  },
  button: {
    padding: spacing.sm,
  },
  dateDisplay: {
    alignItems: 'center',
  },
  monthText: {
    ...typography.subhead,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  yearText: {
    ...typography.caption2,
    color: colors.textMuted,
  }
});
