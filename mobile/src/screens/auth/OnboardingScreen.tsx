import React from 'react';
import { Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { Screen } from '../../components/common/Screen';
import { useAppTheme } from '../../theme/theme';

export const OnboardingScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();

  return (
    <Screen padded={false}>
      <LinearGradient
        colors={['#0D1B3D', '#132B5B', '#1A3A75']}
        style={{
          minHeight: 360,
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          padding: 24,
          justifyContent: 'flex-end',
        }}
      >
        <Text style={[theme.typography.caption, { color: '#CFE3FF' }]}>Pakistan-first utility</Text>
        <Text style={[theme.typography.h1, { color: '#FFFFFF', marginTop: 8 }]}>Split smarter with EasyPaisa, JazzCash, Raast, and cash-friendly settlements.</Text>
        <Text style={[theme.typography.body, { color: '#D9E7FF', marginTop: 12 }]}>Built for trips, flats, office lunches, and family groups that settle in PKR every day.</Text>
      </LinearGradient>

      <View style={{ padding: 24, gap: 16 }}>
        <AppCard>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Offline-safe actions, masked payment details, Urdu-ready flows, and quick debt simplification make the app feel native to how groups actually settle in Pakistan.</Text>
        </AppCard>
        <AppButton label="Continue" onPress={() => navigation.navigate('Register')} />
      </View>
    </Screen>
  );
};
