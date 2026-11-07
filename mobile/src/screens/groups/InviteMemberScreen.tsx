import React, { useEffect, useMemo } from 'react';
import { NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Share, Text, View } from 'react-native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import { useGroupsQuery, useInviteLinkMutation } from '../../store/api/baseApi';
import { useAppTheme } from '../../theme/theme';
import { getApiErrorMessage } from '../../utils/apiError';

export const InviteMemberScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<Record<string, { groupId?: string } | undefined>, string>>();
  const { show } = useToast();
  const groupId = route.params?.groupId;

  const { data: groupsData, isLoading: groupsLoading } = useGroupsQuery();
  const [generateInvite, { data: inviteData, isLoading: inviteLoading }] = useInviteLinkMutation();

  const group = useMemo(
    () => groupsData?.data.find((item) => item._id === groupId),
    [groupId, groupsData?.data],
  );

  const invite = inviteData?.data;

  useEffect(() => {
    if (!groupId) {
      return;
    }

    void generateInvite(groupId);
  }, [generateInvite, groupId]);

  const handleRefreshInvite = async () => {
    if (!groupId) {
      show('Group ID missing for invite generation', { tone: 'error' });
      return;
    }

    try {
      await generateInvite(groupId).unwrap();
      show('Invite details refreshed', { tone: 'success' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Unable to generate invite link'), { tone: 'error' });
    }
  };

  const handleShareInvite = async () => {
    if (!invite) {
      show('Generate the invite first', { tone: 'info' });
      return;
    }

    try {
      await Share.share({
        title: `Join ${group?.name ?? 'my PAK SPLIT group'}`,
        message: [
          `Join my PAK SPLIT group${group?.name ? `: ${group.name}` : ''}`,
          `Invite code: ${invite.inviteCode}`,
          `Link: ${invite.inviteUrl}`,
        ].join('\n'),
      });
    } catch (error) {
      show(getApiErrorMessage(error, 'Unable to open share sheet'), { tone: 'error' });
    }
  };

  if (groupsLoading && !group) {
    return (
      <Screen>
        <AppCard>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Loading invite details...</Text>
        </AppCard>
      </Screen>
    );
  }

  if (!groupId || !group) {
    return (
      <Screen>
        <EmptyState title="Group not found" subtitle="Open a valid group first, then try inviting members again." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: 8 }}>
        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Invite members</Text>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Share this group in seconds</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Send the code to friends on WhatsApp, SMS, or any app they already use. They can request to join from the Join Group screen, and admins can approve or decline.</Text>
      </View>

      <AppCard style={{ gap: theme.spacing.md }}>
        <View style={{ gap: 6 }}>
          <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Selected group</Text>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{group.name}</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{group.description || 'No description added yet.'}</Text>
        </View>

        <View
          style={{
            borderRadius: theme.radius.lg,
            padding: theme.spacing.lg,
            backgroundColor: theme.mode === 'dark' ? '#12283B' : '#EEF5FF',
            gap: theme.spacing.sm,
          }}
        >
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Invite code</Text>
          <Text style={[theme.typography.display, { color: theme.colors.text }]}>{invite?.inviteCode ?? group.inviteCode}</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Share this code with anyone you want to invite. They will send a join request for admin approval.</Text>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Invite link</Text>
          <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{invite?.inviteUrl ?? `paksplit://join/${group.inviteCode}`}</Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>QR placeholder: {invite?.qrPlaceholder ?? `QR:${group.inviteCode}`}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <View style={{ flex: 1 }}>
            <AppButton label="Share invite" onPress={handleShareInvite} loading={inviteLoading} />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton label="Refresh code" variant="secondary" onPress={handleRefreshInvite} loading={inviteLoading} />
          </View>
        </View>

        <AppButton
          label="Test in Join Group"
          variant="ghost"
          onPress={() => navigation.navigate('JoinGroup', { prefillCode: invite?.inviteCode ?? group.inviteCode })}
        />
      </AppCard>
    </Screen>
  );
};
