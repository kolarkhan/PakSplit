import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import { preferencesStorage } from '../../services/preferencesStorage';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setThemePreference } from '../../store/slices/uiSlice';
import { useAppTheme } from '../../theme/theme';

export const ThemeSettingsScreen = () => {
  const theme = useAppTheme();
  const dispatch = useAppDispatch();
  const { show } = useToast();
  const currentPreference = useAppSelector((state) => state.ui.themePreference);
  const [selectedTheme, setSelectedTheme] = useState<'system' | 'light' | 'dark'>(currentPreference);

  useEffect(() => {
    setSelectedTheme(currentPreference);
  }, [currentPreference]);

  const handleSave = async () => {
    dispatch(setThemePreference(selectedTheme));
    await preferencesStorage.setThemePreference(selectedTheme);
    show('Theme preference updated', { tone: 'success' });
  };

  return (
    <Screen>
      <View style={{ gap: 10 }}>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Theme</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Switch between light, dark, or follow-system mode and keep the preference saved for next launch.</Text>
      </View>

      <AppCard style={{ gap: theme.spacing.md }}>
        {[
          {
            label: 'System',
            value: 'system' as const,
            description: 'Automatically follow the device appearance.',
          },
          {
            label: 'Light',
            value: 'light' as const,
            description: 'Bright fintech-style surfaces for everyday use.',
          },
          {
            label: 'Dark',
            value: 'dark' as const,
            description: 'Deep contrast for low-light and night usage.',
          },
        ].map((option) => {
          const selected = option.value === selectedTheme;
          return (
            <AppButton
              key={option.value}
              label={`${option.label}${selected ? ' (Selected)' : ''}`}
              variant={selected ? 'primary' : 'secondary'}
              onPress={() => setSelectedTheme(option.value)}
            />
          );
        })}
      </AppCard>

      <AppButton label="Save theme" onPress={() => void handleSave()} />
    </Screen>
  );
};
