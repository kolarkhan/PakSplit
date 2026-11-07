import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppCard } from '../common/AppCard';
import { useAppTheme } from '../../theme/theme';
import { formatCurrency } from '../../utils/currency';

interface GroupCardProps {
  name: string;
  members: number;
  balance: number;
  onPress?: () => void;
}

export const GroupCard = ({ name, members, balance, onPress }: GroupCardProps) => {
  const theme = useAppTheme();
  const cardBackground = theme.mode === 'dark' ? '#10253A' : '#16324F';
  const mutedText = theme.mode === 'dark' ? '#B7C7D9' : '#B8CAE0';

  const content = (
    <View style={{ gap: 10 }}>
      <Text style={[theme.typography.h3, { color: '#F5FAFF' }]}>{name}</Text>
      <Text style={[theme.typography.caption, { color: mutedText }]}>{members} members active</Text>
      <Text style={[theme.typography.h2, { color: balance >= 0 ? '#63E3A1' : '#FF9B9B' }]}>{formatCurrency(balance)}</Text>
    </View>
  );

  if (!onPress) {
    return <AppCard style={{ backgroundColor: cardBackground, borderColor: 'rgba(255,255,255,0.08)' }}>{content}</AppCard>;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.92 : 1 }]}>
      <AppCard style={{ backgroundColor: cardBackground, borderColor: 'rgba(255,255,255,0.08)' }}>{content}</AppCard>
    </Pressable>
  );
};
