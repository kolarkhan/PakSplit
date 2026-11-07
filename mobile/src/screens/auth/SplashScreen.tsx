import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { AppButton } from '../../components/common/AppButton';
import { Screen } from '../../components/common/Screen';
import { useAppTheme } from '../../theme/theme';

const benefits = [
  'Create a group and add expenses in seconds',
  'Track who owes whom without manual maths',
  'Settle with EasyPaisa, JazzCash, Raast, cash, or bank transfer',
];

export const SplashScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();

  return (
    <Screen padded={false}>
      <View style={{ flex: 1, backgroundColor: '#F3F7FC' }}>
        <LinearGradient
          colors={['#0A1630', '#10254A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            minHeight: 320,
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: 28,
            borderBottomLeftRadius: 36,
            borderBottomRightRadius: 36,
            justifyContent: 'space-between',
          }}
        >
          <View
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.10)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.10)',
            }}
          >
            <Text style={[theme.typography.caption, { color: '#D7E8FF' }]}>Pakistan-first group expense manager</Text>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={[theme.typography.display, { color: '#FFFFFF', maxWidth: 260 }]}>PAK SPLIT</Text>
            <Text style={[theme.typography.h3, { color: '#D7E6FB', lineHeight: 30 }]}>Share expenses, track balances, and settle faster with the payment methods people already use in Pakistan.</Text>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22, gap: 16 }}>
          <View
            style={{
              borderRadius: 26,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2EBF5',
              padding: 18,
              gap: 14,
              ...theme.shadows.floating,
            }}
          >
            <Text style={[theme.typography.h3, { color: '#102342' }]}>A simpler way to split every group expense</Text>
            <View style={{ gap: 12 }}>
              {benefits.map((item, index) => (
                <View key={item} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#EAF2FF',
                      marginTop: 1,
                    }}
                  >
                    <Text style={[theme.typography.caption, { color: '#183A72' }]}>{index + 1}</Text>
                  </View>
                  <Text style={[theme.typography.body, { color: '#5F738F', flex: 1, lineHeight: 22 }]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View
            style={{
              borderRadius: 26,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2EBF5',
              padding: 18,
              gap: 12,
            }}
          >
            <Text style={[theme.typography.bodyStrong, { color: '#102342' }]}>Ready to start your first group?</Text>
            <Text style={[theme.typography.body, { color: '#6A7D97' }]}>Create a trip, flat, office lunch, or family plan and let the app handle the balance tracking.</Text>
            <View style={{ gap: 12, marginTop: 4 }}>
              <AppButton label="Get started" onPress={() => navigation.navigate('Onboarding')} />
              <Pressable
                onPress={() => navigation.navigate('Login')}
                style={({ pressed }) => ({
                  minHeight: 54,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: '#D6E2F0',
                  backgroundColor: '#F9FBFE',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.9 : 1,
                })}
              >
                <Text style={[theme.typography.bodyStrong, { color: '#183A72' }]}>I already have an account</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Screen>
  );
};
