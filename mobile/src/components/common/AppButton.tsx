import React from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';

import { useAppTheme } from '../../theme/theme';

interface AppButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

export const AppButton = ({ label, onPress, variant = 'primary', disabled, loading }: AppButtonProps) => {
  const theme = useAppTheme();
  const backgroundColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
        ? theme.colors.surfaceMuted
        : 'transparent';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        theme.shadows.floating,
        {
          backgroundColor,
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
          borderWidth: variant === 'ghost' ? 1 : 0,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : theme.colors.text} />
      ) : (
        <Text
          style={[
            styles.label,
            theme.typography.bodyStrong,
            { color: variant === 'primary' ? '#fff' : theme.colors.text },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  label: {
    letterSpacing: 0.2,
  },
});
