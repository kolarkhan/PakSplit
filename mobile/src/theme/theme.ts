import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useColorScheme } from 'react-native';

import { useAppSelector } from '../store/hooks';

import { darkColors, lightColors } from './colors';
import { radius, spacing } from './tokens';
import { typography } from './typography';
import { shadows } from './shadows';

export const createTheme = (mode: 'light' | 'dark') => {
  const colors = mode === 'dark' ? darkColors : lightColors;

  return {
    mode,
    colors,
    spacing,
    radius,
    typography,
    shadows,
    navigationTheme: {
      ...(mode === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        primary: colors.primary,
        notification: colors.danger,
      },
    },
  };
};

export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const themePreference = useAppSelector((state) => state.ui.themePreference);
  const resolvedMode =
    themePreference === 'system' ? (colorScheme === 'dark' ? 'dark' : 'light') : themePreference;

  return createTheme(resolvedMode);
};

export type AppTheme = ReturnType<typeof createTheme>;
