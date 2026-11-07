import React from 'react';
import { Text, View } from 'react-native';

import { useAppTheme } from '../../theme/theme';

export const SyncBadge = ({ label }: { label: string }) => {
  const theme = useAppTheme();

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: theme.colors.surfaceMuted,
      }}
    >
      <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{label}</Text>
    </View>
  );
};
