import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AppButton } from '../../components/common/AppButton';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import { ControlledTextInput } from '../../components/forms/ControlledTextInput';
import { preferencesStorage } from '../../services/preferencesStorage';
import { tokenStorage } from '../../services/tokenStorage';
import { api, useRegisterMutation } from '../../store/api/baseApi';
import { useAppDispatch } from '../../store/hooks';
import { setSession } from '../../store/slices/sessionSlice';
import { useAppTheme } from '../../theme/theme';
import { getApiErrorMessage } from '../../utils/apiError';
import { registerSchema } from '../../validators/auth';

export const RegisterScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { show } = useToast();
  const [register, { isLoading }] = useRegisterMutation();
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phone: '', password: '' },
  });

  const handleRegister = handleSubmit(async (values) => {
    try {
      const response = await register({
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
      }).unwrap();

      await preferencesStorage.clearAvatarUri();
      await tokenStorage.setTokens(response.data.tokens.accessToken, response.data.tokens.refreshToken);
      dispatch(api.util.resetApiState());
      dispatch(
        setSession({
          accessToken: response.data.tokens.accessToken,
          refreshToken: response.data.tokens.refreshToken,
          user: response.data.user,
        }),
      );
      show('Account created successfully', { tone: 'success' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Registration failed'), { tone: 'error' });
    }
  });

  return (
    <Screen>
      <View style={{ gap: 10 }}>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Create your account</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Get a clean ledger for every trip, flat, event, and family plan.</Text>
      </View>
      <ControlledTextInput control={control} name={'fullName'} label="Full name" />
      <ControlledTextInput control={control} name={'email'} label="Email" />
      <ControlledTextInput control={control} name={'phone'} label="Phone" />
      <ControlledTextInput control={control} name={'password'} label="Password" secureTextEntry />
      <AppButton label="Create account" onPress={handleRegister} loading={isLoading} />
      <AppButton label="Already have an account" variant="secondary" onPress={() => navigation.navigate('Login')} />
    </Screen>
  );
};
