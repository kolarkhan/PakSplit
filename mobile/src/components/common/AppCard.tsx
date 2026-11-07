import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { useAppTheme } from '../../theme/theme';

export const AppCard = ({ style, ...props }: ViewProps) => {
  const theme = useAppTheme();

  return (
    <View
      {...props}
      style={[
        styles.card,
        theme.shadows.card,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
  },
});
