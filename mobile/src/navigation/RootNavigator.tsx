import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAppSelector } from '../store/hooks';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { LanguageSettingsScreen } from '../screens/settings/LanguageSettingsScreen';
import { CurrencySettingsScreen } from '../screens/settings/CurrencySettingsScreen';
import { ThemeSettingsScreen } from '../screens/settings/ThemeSettingsScreen';
import { PaymentMethodsScreen } from '../screens/settings/PaymentMethodsScreen';
import { CategoryInsightsScreen } from '../screens/reports/CategoryInsightsScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const isAuthenticated = useAppSelector((state) => state.session.isAuthenticated);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="LanguageSettings" component={LanguageSettingsScreen} />
          <Stack.Screen name="CurrencySettings" component={CurrencySettingsScreen} />
          <Stack.Screen name="ThemeSettings" component={ThemeSettingsScreen} />
          <Stack.Screen name="PaymentMethodsSettings" component={PaymentMethodsScreen} />
          <Stack.Screen name="CategoryInsights" component={CategoryInsightsScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};
