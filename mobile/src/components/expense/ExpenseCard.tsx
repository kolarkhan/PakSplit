import React from 'react';
import { Text, View } from 'react-native';

import { AppCard } from '../common/AppCard';
import { useAppTheme } from '../../theme/theme';
import { formatCurrency } from '../../utils/currency';
import { formatShortDate } from '../../utils/date';

const formatCategoryLabel = (category: string) =>
  category
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export const ExpenseCard = ({ title, category, totalAmount, expenseDate, groupName }: { title: string; category: string; totalAmount: number; expenseDate: string; groupName?: string }) => {
  const theme = useAppTheme();

  return (
    <AppCard>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
            {formatCategoryLabel(category)} • {formatShortDate(expenseDate)}
          </Text>
        </View>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{formatCurrency(totalAmount)}</Text>
      </View>
    </AppCard>
  );
};
