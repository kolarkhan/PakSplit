import React from 'react';
import { Text, View } from 'react-native';

import { AppCard } from '../common/AppCard';
import { useAppTheme } from '../../theme/theme';
import { formatCurrency } from '../../utils/currency';

export const SpendingChartCard = ({ data }: { data: Array<{ label: string; amount: number }> }) => {
  const theme = useAppTheme();
  const max = Math.max(...data.map((item) => item.amount), 1);

  return (
    <AppCard>
      <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Spending by category</Text>
      <View style={{ gap: 12, marginTop: 12 }}>
        {data.map((item) => (
          <View key={item.label} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{item.label}</Text>
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{formatCurrency(item.amount)}</Text>
            </View>
            <View style={{ height: 10, borderRadius: 999, backgroundColor: theme.colors.surfaceMuted }}>
              <View style={{ width: `${(item.amount / max) * 100}%`, height: 10, borderRadius: 999, backgroundColor: theme.colors.primary }} />
            </View>
          </View>
        ))}
      </View>
    </AppCard>
  );
};
