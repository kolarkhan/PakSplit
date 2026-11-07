import React from 'react';
import { Text, View } from 'react-native';

import { useAppTheme } from '../../theme/theme';
import { formatCurrency } from '../../utils/currency';

export const BalancePill = ({ amount, positive }: { amount: number; positive: boolean }) => {
  const theme = useAppTheme();
  const backgroundColor = positive ? theme.colors.success : theme.colors.danger;

  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={[theme.typography.caption, { color: '#fff' }]}>{formatCurrency(amount)}</Text>
    </View>
  );
};
