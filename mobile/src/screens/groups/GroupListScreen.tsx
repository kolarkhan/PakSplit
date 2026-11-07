import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { EmptyState } from '../../components/common/EmptyState';
import { GroupCard } from '../../components/group/GroupCard';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import { apiBaseUrl } from '../../constants/config';
import { tokenStorage } from '../../services/tokenStorage';
import { useGroupsQuery } from '../../store/api/baseApi';
import { useAppSelector } from '../../store/hooks';
import { useAppTheme } from '../../theme/theme';
import type { ApiEnvelope, GroupBalanceSummaryResponse } from '../../types/models';

export const GroupListScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { show } = useToast();
  const fallbackGroups = useAppSelector((state) => state.groups.items);
  const { data, isLoading, isError } = useGroupsQuery();
  const [liveBalances, setLiveBalances] = useState<Record<string, number>>({});

  useEffect(() => {
    const groups = data?.data ?? [];

    if (groups.length === 0) {
      setLiveBalances({});
      return;
    }

    let isMounted = true;

    const loadBalances = async () => {
      try {
        const accessToken = await tokenStorage.getAccessToken();
        const results = await Promise.all(
          groups.map(async (group) => {
            const response = await fetch(`${apiBaseUrl}/balances/group/${group._id}`, {
              headers: accessToken ? { authorization: `Bearer ${accessToken}` } : undefined,
            });

            if (!response.ok) {
              throw new Error(`Could not load balance for ${group.name}`);
            }

            const payload = (await response.json()) as ApiEnvelope<GroupBalanceSummaryResponse>;
            return [group._id, payload.data?.summary?.netBalance ?? 0] as const;
          }),
        );

        if (isMounted) {
          setLiveBalances(Object.fromEntries(results));
        }
      } catch (error) {
        if (isMounted) {
          show(error instanceof Error ? error.message : 'Unable to load group balances', { tone: 'error' });
        }
      }
    };

    void loadBalances();

    return () => {
      isMounted = false;
    };
  }, [data?.data, show]);

  const groups = useMemo(() => {
    if (data?.data) {
      return data.data.map((group) => ({
        id: group._id,
        name: group.name,
        description: group.description ?? 'No description added yet.',
        members: group.members?.filter((member) => member.status === 'active').length ?? 1,
        balance: liveBalances[group._id] ?? 0,
        inviteCode: group.inviteCode,
        source: 'server' as const,
      }));
    }

    if (isError) {
      return fallbackGroups;
    }

    return [];
  }, [data, fallbackGroups, isError, liveBalances]);

  const handleJoiningHelp = () => {
    Alert.alert(
      'Join flow',
      'Ask a friend for the invite code, open Join by code, and the group will appear here. Demo invite codes still work as placeholders.',
    );
  };

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg }}>
        <AppCard style={{ backgroundColor: theme.mode === 'dark' ? '#0C2033' : '#EAF2FF', gap: theme.spacing.md }}>
          <View style={{ gap: 8 }}>
            <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Your groups</Text>
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Create a new circle or join an existing one with an invite code. Perfect for trips, flats, office lunches, and family events.</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <View style={{ flex: 1 }}>
              <AppButton label="Create group" onPress={() => navigation.navigate('CreateGroup')} />
            </View>
            <View style={{ flex: 1 }}>
              <AppButton label="Join by code" variant="secondary" onPress={() => navigation.navigate('JoinGroup')} />
            </View>
          </View>
        </AppCard>

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.sm }}>
            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Active groups</Text>
            <Pressable
              onPress={handleJoiningHelp}
              hitSlop={8}
              style={({ pressed }) => ({
                width: 28,
                height: 28,
                borderRadius: theme.radius.pill,
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 'auto',
                backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : '#EAF2FF',
                borderWidth: 1,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.88 : 1,
              })}
            >
              <Ionicons name="help-outline" size={16} color={theme.colors.textMuted} />
            </Pressable>
          </View>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Tap any card to open balances, invite code context, and the group's expense snapshot.</Text>
        </View>

        {isLoading ? (
          <AppCard>
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Loading your groups...</Text>
          </AppCard>
        ) : groups.length > 0 ? (
          groups.map((group) => (
            <View key={group.id} style={{ gap: theme.spacing.xs }}>
              <GroupCard
                name={group.name}
                members={group.members}
                balance={group.balance}
                onPress={() => navigation.navigate('GroupDetails', { groupId: group.id })}
              />
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted, paddingHorizontal: 4 }]}>Invite code: {group.inviteCode}</Text>
            </View>
          ))
        ) : (
          <EmptyState
            title="No groups yet"
            subtitle={isError ? 'Could not reach the server. Start the backend or check your API URL, then try again.' : 'Create your first group and it will appear here from MongoDB.'}
          />
        )}
      </View>
    </Screen>
  );
};


