import React from 'react';
import { Text, View } from 'react-native';

import { AppButton } from './AppButton';
import { AppCard } from './AppCard';
import { Screen } from './Screen';
import { useAppTheme } from '../../theme/theme';

interface FeatureScreenProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets?: string[];
  ctaLabel?: string;
}

export const FeatureScreen = ({ eyebrow, title, description, bullets = [], ctaLabel = 'Coming soon' }: FeatureScreenProps) => {
  const theme = useAppTheme();

  return (
    <Screen>
      <View style={{ gap: 10 }}>
        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>{eyebrow}</Text>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{description}</Text>
      </View>
      <AppCard>
        <View style={{ gap: 12 }}>
          {bullets.map((bullet) => (
            <Text key={bullet} style={[theme.typography.body, { color: theme.colors.text }]}>
              • {bullet}
            </Text>
          ))}
        </View>
      </AppCard>
      <AppButton label={ctaLabel} variant="secondary" />
    </Screen>
  );
};
