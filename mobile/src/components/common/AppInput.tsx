import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useAppTheme } from '../../theme/theme';

interface AppInputProps extends TextInputProps {
  label: string;
  error?: string;
}

export const AppInput = ({ label, error, style, ...props }: AppInputProps) => {
  const theme = useAppTheme();

  return (
    <View style={styles.wrapper}>
      <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{label}</Text>
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surfaceMuted,
            color: theme.colors.text,
            borderColor: error ? theme.colors.danger : theme.colors.border,
          },
          style,
        ]}
        {...props}
      />
      {error ? <Text style={[theme.typography.caption, { color: theme.colors.danger }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 16,
  },
});
