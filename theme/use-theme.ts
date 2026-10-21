import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { AppColors, darkColors, lightColors } from './colors';

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors: AppColors = isDark ? darkColors : lightColors;
  return { colors, isDark };
}

type Styles = StyleSheet.NamedStyles<any> | { [key: string]: any };

/**
 * Build a StyleSheet that follows the current color scheme.
 * Define the factory at module level: `const useStyles = makeStyles((c) => ({ ... }))`.
 */
export function makeStyles<T extends Styles>(factory: (colors: AppColors, isDark: boolean) => T) {
  return function useStyles() {
    const { colors, isDark } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors, isDark) as any) as unknown as { [K in keyof T]: any }, [colors, isDark]);
  };
}
