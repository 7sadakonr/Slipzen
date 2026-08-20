import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { typography, colors } from '../../theme';

interface AmountTextProps extends TextProps {
  amount: number;
  showCurrency?: boolean;
}

export function AmountText({ amount, showCurrency = true, style, ...props }: AmountTextProps) {
  const formatted = amount.toLocaleString('th-TH', { 
    minimumFractionDigits: 0, 
    maximumFractionDigits: 2 
  });
  
  return (
    <Text 
      style={[styles.text, style]} 
      {...props}
    >
      {showCurrency ? `฿${formatted}` : formatted}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.amount,
    color: colors.textPrimary,
  },
});
