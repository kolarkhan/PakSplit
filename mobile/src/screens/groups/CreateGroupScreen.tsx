import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import { useCreateGroupMutation } from '../../store/api/baseApi';
import { useAppTheme } from '../../theme/theme';
import { getApiErrorMessage } from '../../utils/apiError';

export const CreateGroupScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { show } = useToast();
  const [createGroup, { isLoading }] = useCreateGroupMutation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | undefined>();

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Group name is required');
      return;
    }

    try {
      const response = await createGroup({
        name: trimmedName,
        description: description.trim() || undefined,
      }).unwrap();

      setError(undefined);
      show(trimmedName + ' created successfully', { tone: 'success' });
      navigation.navigate('GroupDetails', { groupId: response.data._id });
    } catch (apiError) {
      show(getApiErrorMessage(apiError, 'Could not create group'), { tone: 'error' });
    }
  };

  return (
    <Screen>
      <View style={{ gap: 8 }}>
        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Groups</Text>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Create a new group</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Set up a trip, flat, office lunch circle, or family event group in under a minute.</Text>
      </View>

      <AppCard style={{ gap: theme.spacing.md }}>
        <AppInput
          label="Group name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            if (error) {
              setError(undefined);
            }
          }}
          error={error}
          placeholder="Weekend trip crew"
        />
        <AppInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Murree expenses for rides, dinners, and stay"
          multiline
          numberOfLines={4}
          style={{ minHeight: 110, textAlignVertical: 'top', paddingTop: 16 }}
        />
        <View style={{ gap: 6 }}>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Good examples</Text>
          <Text style={[theme.typography.body, { color: theme.colors.text }]}>Trip group, office lunch group, flat bills group, family event group</Text>
        </View>
      </AppCard>

      <AppButton label="Create group" onPress={handleCreate} loading={isLoading} />
    </Screen>
  );
};

