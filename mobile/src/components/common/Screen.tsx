import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';

import { TopAppHeader } from './TopAppHeader';
import { useAppTheme } from '../../theme/theme';

interface ScreenProps {
  children: React.ReactNode;
  padded?: boolean;
  showHeader?: boolean;
}

const headerlessRoutes = new Set([
  'Splash',
  'Onboarding',
  'Login',
  'Register',
  'ForgotPassword',
  'DashboardHome',
]);

export const Screen = ({ children, padded = true, showHeader }: ScreenProps) => {
  const theme = useAppTheme();
  const route = useRoute();
  const shouldShowHeader = showHeader ?? !headerlessRoutes.has(route.name);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}> 
      {shouldShowHeader ? <TopAppHeader /> : null}
      <ScrollView
        contentContainerStyle={[
          styles.content,
          padded && { paddingHorizontal: theme.spacing.lg },
        ]}
      >
        <View style={{ gap: theme.spacing.lg }}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingBottom: 36 },
});

