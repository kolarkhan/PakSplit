import React from 'react';
import { Text, View } from 'react-native';

import { useAppTheme } from '../../theme/theme';

export const EmptyState = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const theme = useAppTheme();

  return (
    <View
      style={{
        borderRadius: 24,
        padding: 24,
        gap: 8,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{title}</Text>
      <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{subtitle}</Text>
    </View>
  );
};
