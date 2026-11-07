import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import { useUpdateMeMutation } from '../../store/api/baseApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrentUser } from '../../store/slices/sessionSlice';
import { useAppTheme } from '../../theme/theme';
import { getApiErrorMessage } from '../../utils/apiError';

export const EditProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { show } = useToast();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.session.user);
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency ?? 'PKR');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'ur'>((user?.preferredLanguage as 'en' | 'ur') ?? 'en');
  const [error, setError] = useState<string | undefined>();

  const languageOptions = useMemo(
    () => [
      { label: 'English', value: 'en' as const },
      { label: 'Urdu', value: 'ur' as const },
    ],
    [],
  );

  if (!user) {
    return (
      <Screen>
        <AppCard>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Profile data is unavailable. Please log in again.</Text>
        </AppCard>
      </Screen>
    );
  }

  const handleSave = async () => {
    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters');
      return;
    }

    if (phone.trim() && phone.replace(/\D/g, '').length < 10) {
      setError('Phone number looks too short');
      return;
    }

    try {
      const payload = await updateMe({
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        preferredCurrency: preferredCurrency.trim() || 'PKR',
        preferredLanguage,
      }).unwrap();

      dispatch(setCurrentUser(payload.data));
      setError(undefined);
      show('Profile updated successfully', { tone: 'success' });
      navigation.goBack();
    } catch (apiError) {
      show(getApiErrorMessage(apiError, 'Could not update profile'), { tone: 'error' });
    }
  };

  return (
    <Screen>
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Profile</Text>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Edit your details</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Keep your account name, phone, language, and currency preferences up to date.</Text>
      </View>

      <AppCard style={{ gap: theme.spacing.md }}>
        <AppInput
          label="Full name"
          value={fullName}
          onChangeText={(value) => {
            setFullName(value);
            if (error) {
              setError(undefined);
            }
          }}
          error={error}
          placeholder="Kolar Khan"
        />

        <AppInput
          label="Email"
          value={user.email}
          editable={false}
          style={{ opacity: 0.7 }}
        />

        <AppInput
          label="Phone number"
          value={phone}
          onChangeText={(value) => {
            setPhone(value);
            if (error) {
              setError(undefined);
            }
          }}
          placeholder="03xx xxxxxxx"
          keyboardType="phone-pad"
        />
      </AppCard>

      <AppCard style={{ gap: theme.spacing.md }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Preferred language</Text>
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          {languageOptions.map((option) => {
            const selected = preferredLanguage === option.value;
            return (
              <AppButton
                key={option.value}
                label={option.label}
                variant={selected ? 'primary' : 'secondary'}
                onPress={() => setPreferredLanguage(option.value)}
              />
            );
          })}
        </View>
      </AppCard>

      <AppCard style={{ gap: theme.spacing.md }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Preferred currency</Text>
        <AppInput
          label="Currency code"
          value={preferredCurrency}
          onChangeText={(value) => setPreferredCurrency(value.toUpperCase())}
          placeholder="PKR"
          autoCapitalize="characters"
          maxLength={3}
        />
      </AppCard>

      <View style={{ gap: theme.spacing.sm }}>
        <AppButton label="Save changes" onPress={() => void handleSave()} loading={isLoading} />
        <AppButton label="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
};
