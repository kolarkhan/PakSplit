import React, { useState } from 'react';
import { Text, View } from 'react-native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import { useUpdateMeMutation } from '../../store/api/baseApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrentUser } from '../../store/slices/sessionSlice';
import { useAppTheme } from '../../theme/theme';
import { getApiErrorMessage } from '../../utils/apiError';

export const LanguageSettingsScreen = () => {
  const theme = useAppTheme();
  const { show } = useToast();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.session.user);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ur'>((user?.preferredLanguage as 'en' | 'ur') ?? 'en');
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  const handleSave = async () => {
    try {
      const payload = await updateMe({ preferredLanguage: selectedLanguage }).unwrap();
      dispatch(setCurrentUser(payload.data));
      show('Language preference updated', { tone: 'success' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not update language'), { tone: 'error' });
    }
  };

  return (
    <Screen>
      <View style={{ gap: 10 }}>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Language</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Choose the language you want for labels, prompts, and future Urdu-first flows.</Text>
      </View>

      <AppCard style={{ gap: theme.spacing.md }}>
        {[
          { label: 'English', value: 'en' as const, description: 'Best for the current full app experience.' },
          { label: 'Urdu', value: 'ur' as const, description: 'Prepares your account for Urdu-ready UI and content.' },
        ].map((option) => {
          const selected = option.value === selectedLanguage;
          return (
            <AppButton
              key={option.value}
              label={`${option.label}${selected ? ' (Selected)' : ''}`}
              variant={selected ? 'primary' : 'secondary'}
              onPress={() => setSelectedLanguage(option.value)}
            />
          );
        })}
      </AppCard>

      <AppButton label="Save language" onPress={() => void handleSave()} loading={isLoading} />
    </Screen>
  );
};
