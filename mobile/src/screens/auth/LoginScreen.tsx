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
import { api, useLoginMutation } from '../../store/api/baseApi';
import { useAppDispatch } from '../../store/hooks';
import { setSession } from '../../store/slices/sessionSlice';
import { useAppTheme } from '../../theme/theme';
import { getApiErrorMessage } from '../../utils/apiError';
import { loginSchema } from '../../validators/auth';

export const LoginScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { show } = useToast();
  const [login, { isLoading }] = useLoginMutation();
  const { control, handleSubmit } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleLogin = handleSubmit(async (values) => {
    try {
      const response = await login({ email: values.email, password: values.password }).unwrap();
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
      show('Logged in successfully', { tone: 'success' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Login failed'), { tone: 'error' });
    }
  });

  return (
    <Screen>
      <View style={{ gap: 10 }}>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Welcome back</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Log in to manage group spending, balances, and settlements.</Text>
      </View>
      <ControlledTextInput control={control} name={'email'} label="Email" />
      <ControlledTextInput control={control} name={'password'} label="Password" secureTextEntry />
      <AppButton label="Log in" onPress={handleLogin} loading={isLoading} />
      <AppButton label="Forgot password" variant="secondary" onPress={() => navigation.navigate('ForgotPassword')} />
    </Screen>
  );
};
