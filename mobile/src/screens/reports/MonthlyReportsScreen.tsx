import React from 'react';
import { Text, View } from 'react-native';

import { Screen } from '../../components/common/Screen';
import { SpendingChartCard } from '../../components/analytics/SpendingChartCard';
import { useAppTheme } from '../../theme/theme';

export const MonthlyReportsScreen = () => {
  const theme = useAppTheme();
  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg }}>
      <View style={{ gap: 8 }}>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Monthly insights</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>See where your money went across travel, rent, food, and utilities.</Text>
      </View>
      <SpendingChartCard data={[{ label: 'Food', amount: 12000 }, { label: 'Travel', amount: 8200 }, { label: 'Utilities', amount: 3200 }]} />
      </View>
    </Screen>
  );
};

