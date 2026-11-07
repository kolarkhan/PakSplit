import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from './components/common/ToastProvider';
import { apiBaseUrl } from './constants/config';
import { RootNavigator } from './navigation/RootNavigator';
import { preferencesStorage } from './services/preferencesStorage';
import { tokenStorage } from './services/tokenStorage';
import { useAppDispatch } from './store/hooks';
import { store } from './store';
import { clearSession, setSession } from './store/slices/sessionSlice';
import { setThemePreference } from './store/slices/uiSlice';
import { useAppTheme } from './theme/theme';
import type { ApiEnvelope, User } from './types/models';

const SessionBootstrap = () => {
  const dispatch = useAppDispatch();
  const theme = useAppTheme();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isActive = true;

    const bootstrap = async () => {
      const accessToken = await tokenStorage.getAccessToken();
      const refreshToken = await tokenStorage.getRefreshToken();

      if (!accessToken || !refreshToken) {
        dispatch(clearSession());
        if (isActive) {
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/users/me`, {
          headers: {
            authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Session restore failed');
        }

        const payload = (await response.json()) as ApiEnvelope<User>;
        const avatarOverride = await preferencesStorage.getAvatarUri();
        dispatch(
          setSession({
            accessToken,
            refreshToken,
            user: avatarOverride ? { ...payload.data, avatarUrl: avatarOverride } : payload.data,
          }),
        );
      } catch {
        await tokenStorage.clear();
        dispatch(clearSession());
      } finally {
        if (isActive) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isActive = false;
    };
  }, [dispatch]);

  if (isBootstrapping) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <RootNavigator />;
};

const AppContent = () => {
  const dispatch = useAppDispatch();
  const { navigationTheme, mode } = useAppTheme();

  useEffect(() => {
    let isActive = true;

    const bootstrapPreferences = async () => {
      const storedTheme = await preferencesStorage.getThemePreference();
      if (!isActive) {
        return;
      }

      if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
        dispatch(setThemePreference(storedTheme));
      }
    };

    void bootstrapPreferences();

    return () => {
      isActive = false;
    };
  }, [dispatch]);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <ToastProvider>
        <SessionBootstrap />
      </ToastProvider>
    </NavigationContainer>
  );
};

const App = () => (
  <Provider store={store}>
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  </Provider>
);

export default App;
