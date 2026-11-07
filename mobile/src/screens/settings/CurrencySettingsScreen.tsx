import React, { useState } from 'react';
import { Text, View } from 'react-native';

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

export const CurrencySettingsScreen = () => {
  const theme = useAppTheme();
  const { show } = useToast();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.session.user);
  const [preferredCurrency, setPreferredCurrency] = useState(user?.preferredCurrency ?? 'PKR');
  const [updateMe, { isLoading }] = useUpdateMeMutation();

  const handleSave = async () => {
    try {
      const payload = await updateMe({ preferredCurrency: preferredCurrency.trim().toUpperCase() || 'PKR' }).unwrap();
      dispatch(setCurrentUser(payload.data));
      show('Currency preference updated', { tone: 'success' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not update currency'), { tone: 'error' });
    }
  };

  return (
    <Screen>
      <View style={{ gap: 10 }}>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Currency</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>PKR is recommended for Pakistan-first expense sharing, but your preference can still be stored here.</Text>
      </View>

      <AppCard style={{ gap: theme.spacing.md }}>
        <AppInput
          label="Preferred currency code"
          value={preferredCurrency}
          onChangeText={(value) => setPreferredCurrency(value.toUpperCase())}
          autoCapitalize="characters"
          maxLength={3}
          placeholder="PKR"
        />
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Example: PKR. Future multi-currency support can build on this preference later.</Text>
      </AppCard>

      <AppButton label="Save currency" onPress={() => void handleSave()} loading={isLoading} />
    </Screen>
  );
};
