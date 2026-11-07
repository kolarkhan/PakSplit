import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import { AppCard } from '../../components/common/AppCard';
import { Screen } from '../../components/common/Screen';
import { useAppTheme } from '../../theme/theme';

const settingItems = [
  {
    label: 'Language',
    description: 'Switch between English today and Urdu-ready flows later.',
    route: 'LanguageSettings',
    icon: 'language-outline' as const,
  },
  {
    label: 'Currency',
    description: 'Keep PKR as default and control future multi-currency behavior.',
    route: 'CurrencySettings',
    icon: 'cash-outline' as const,
  },
  {
    label: 'Theme',
    description: 'Light, dark, or system-follow visual style.',
    route: 'ThemeSettings',
    icon: 'contrast-outline' as const,
  },
  {
    label: 'Payment methods',
    description: 'Manage EasyPaisa, JazzCash, Raast, and bank details.',
    route: 'PaymentMethodsSettings',
    icon: 'card-outline' as const,
  },
];

export const SettingsScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  return (
    <Screen>
      <View style={{ gap: 10 }}>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Settings</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Language, theme, currency, payment preferences, and account control in one place.</Text>
      </View>

      {settingItems.map((item) => (
        <Pressable key={item.label} onPress={() => navigation.navigate(item.route)}>
          {({ pressed }) => (
            <AppCard style={{ opacity: pressed ? 0.95 : 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: theme.radius.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.mode === 'dark' ? '#10263A' : '#EAF2FF',
                    }}
                  >
                    <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{item.label}</Text>
                    <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{item.description}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward-outline" size={18} color={theme.colors.textMuted} />
              </View>
            </AppCard>
          )}
        </Pressable>
      ))}
    </Screen>
  );
};
