import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../theme/theme';

interface StatCardProps {
  label: string;
  value: string;
  tone?: 'neutral' | 'success' | 'danger';
  onPress?: () => void;
}

export const StatCard = ({ label, value, tone = 'neutral', onPress }: StatCardProps) => {
  const theme = useAppTheme();
  const accent = tone === 'success' ? theme.colors.success : tone === 'danger' ? theme.colors.danger : theme.colors.primary;

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        theme.shadows.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.94 : 1,
        },
      ]}
    >
      <View style={[styles.bar, { backgroundColor: accent }]} />
      <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{label}</Text>
      <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{value}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 116,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  bar: {
    width: 36,
    height: 5,
    borderRadius: 999,
  },
});
