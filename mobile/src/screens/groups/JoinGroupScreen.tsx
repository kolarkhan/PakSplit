import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import { useJoinByInviteMutation } from '../../store/api/baseApi';
import { useAppTheme } from '../../theme/theme';
import { getApiErrorMessage } from '../../utils/apiError';

export const JoinGroupScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<Record<string, { prefillCode?: string } | undefined>, string>>();
  const { show } = useToast();
  const [joinByInvite, { isLoading }] = useJoinByInviteMutation();
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (route.params?.prefillCode) {
      setInviteCode(route.params.prefillCode);
    }
  }, [route.params?.prefillCode]);

  const handleJoin = async () => {
    const normalizedCode = inviteCode.trim();
    if (!normalizedCode) {
      setError('Invite code is required');
      return;
    }

    try {
      const response = await joinByInvite(normalizedCode).unwrap();
      setError(undefined);
      show(`Join request sent for ${response.data.name}`, { tone: 'success' });
      navigation.navigate('Groups');
    } catch (joinError) {
      setError(getApiErrorMessage(joinError, 'Unable to join this group'));
      show(getApiErrorMessage(joinError, 'Unable to join this group'), { tone: 'error' });
    }
  };

  return (
    <Screen>
      <View style={{ gap: 8 }}>
        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Join by code</Text>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Enter an invite code</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Ask your group admin to share the code from the Invite Member screen, then paste it here to send a join request for approval.</Text>
      </View>

      <AppCard style={{ gap: theme.spacing.md }}>
        <AppInput
          label="Invite code"
          value={inviteCode}
          onChangeText={(value) => {
            setInviteCode(value);
            if (error) {
              setError(undefined);
            }
          }}
          error={error}
          autoCapitalize="none"
          placeholder="AB12CD34EF"
        />
        <AppButton label="Send join request" onPress={() => void handleJoin()} loading={isLoading} />
      </AppCard>

      <AppCard style={{ gap: theme.spacing.sm }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>How it works</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>1. Ask a group admin to open Group Details and tap Invite Member.</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>2. They share the code or deep link on WhatsApp, SMS, or any other app.</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>3. Paste the code here and the admin will get your request to approve or decline.</Text>
      </AppCard>
    </Screen>
  );
};
