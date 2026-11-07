import React from 'react';
import { Pressable, Text } from 'react-native';

import { useAppTheme } from '../../theme/theme';

export const SettlementMethodChip = ({ label }: { label: string }) => {
  const theme = useAppTheme();
  return (
    <Pressable
      style={{
        borderRadius: 18,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 14,
        paddingVertical: 12,
      }}
    >
      <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
};
