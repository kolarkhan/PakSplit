import { Image, Pressable, Text, View } from 'react-native';
import { NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useMemo } from 'react';

import { AppCard } from '../../components/common/AppCard';
import { AppButton } from '../../components/common/AppButton';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import {
  useApproveJoinRequestMutation,
  useDeclineJoinRequestMutation,
  useGroupByIdQuery,
} from '../../store/api/baseApi';
import { useAppSelector } from '../../store/hooks';
import { useAppTheme } from '../../theme/theme';
import { getApiErrorMessage } from '../../utils/apiError';

const RequestActionButton = ({
  label,
  tone,
  disabled,
  loading,
  onPress,
}: {
  label: string;
  tone: 'success' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  const backgroundColor = tone === 'success' ? theme.colors.success : theme.colors.danger;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 48,
        borderRadius: theme.radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.md,
        backgroundColor,
        opacity: disabled || loading ? 0.55 : pressed ? 0.9 : 1,
      })}
    >
      <Text style={[theme.typography.bodyStrong, { color: '#FFFFFF' }]}>{loading ? `${label}...` : label}</Text>
    </Pressable>
  );
};

export const GroupPendingRequestsScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<Record<string, { groupId?: string } | undefined>, string>>();
  const { show } = useToast();
  const sessionUser = useAppSelector((state) => state.session.user);
  const groupId = route.params?.groupId ?? '';

  const { data, isLoading, isFetching } = useGroupByIdQuery(groupId, { skip: !groupId });
  const [approveJoinRequest, { isLoading: approvingRequest }] = useApproveJoinRequestMutation();
  const [declineJoinRequest, { isLoading: decliningRequest }] = useDeclineJoinRequestMutation();

  const group = data?.data;
  const isCurrentUserAdmin = useMemo(() => {
    return (group?.members ?? []).some((member) => {
      const userRef = member.userId;
      const memberId = typeof userRef === 'object' && userRef !== null ? userRef._id : userRef;
      return memberId === sessionUser?._id && member.status === 'active' && member.role === 'admin';
    });
  }, [group?.members, sessionUser?._id]);

  const pendingRequests = useMemo(() => {
    return (group?.members ?? [])
      .filter((member) => member.status === 'pending')
      .map((member, index) => {
        const userRef = member.userId;
        const isObject = typeof userRef === 'object' && userRef !== null;
        const memberId = isObject ? userRef._id : userRef;
        const fullName = isObject ? userRef.fullName : `Requester ${index + 1}`;

        return {
          id: String(memberId),
          fullName,
          avatarInitial: fullName.charAt(0).toUpperCase(),
          avatarUrl: isObject ? userRef.avatarUrl : undefined,
        };
      });
  }, [group?.members]);

  const handleApproveRequest = async (userId: string, fullName: string) => {
    if (!groupId) {
      return;
    }

    try {
      await approveJoinRequest({ groupId, userId }).unwrap();
      show(`${fullName} added to the group`, { tone: 'success' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not approve this request'), { tone: 'error' });
    }
  };

  const handleDeclineRequest = async (userId: string, fullName: string) => {
    if (!groupId) {
      return;
    }

    try {
      await declineJoinRequest({ groupId, userId }).unwrap();
      show(`${fullName}'s request was declined`, { tone: 'info' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not decline this request'), { tone: 'error' });
    }
  };

  if (isLoading || isFetching) {
    return (
      <Screen>
        <AppCard>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Loading join requests...</Text>
        </AppCard>
      </Screen>
    );
  }

  if (!group) {
    return (
      <Screen>
        <EmptyState title="Group not found" subtitle="Open a valid group first, then manage its join requests." />
      </Screen>
    );
  }

  if (!isCurrentUserAdmin) {
    return (
      <Screen>
        <EmptyState title="Admin access required" subtitle="Only active admins can approve or decline pending join requests." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: 8 }}>
        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Pending Requests</Text>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>{group.name}</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Review new join requests without leaving the admin workflow.</Text>
      </View>

      {pendingRequests.length === 0 ? (
        <EmptyState title="No pending requests" subtitle="When someone requests to join this group, their profile will appear here for approval." />
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          {pendingRequests.map((request) => (
            <AppCard key={request.id} style={{ gap: theme.spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: theme.radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : '#EAF2FF',
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    overflow: 'hidden',
                  }}
                >
                  {request.avatarUrl ? (
                    <Image source={{ uri: request.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                  ) : (
                    <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{request.avatarInitial}</Text>
                  )}
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{request.fullName}</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Waiting for your approval to join this group.</Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <RequestActionButton
                    label="Accept"
                    tone="success"
                    onPress={() => void handleApproveRequest(request.id, request.fullName)}
                    loading={approvingRequest}
                    disabled={decliningRequest}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <RequestActionButton
                    label="Decline"
                    tone="danger"
                    onPress={() => void handleDeclineRequest(request.id, request.fullName)}
                    loading={decliningRequest}
                    disabled={approvingRequest}
                  />
                </View>
              </View>
            </AppCard>
          ))}
        </View>
      )}

      <AppButton label="Back to group settings" variant="ghost" onPress={() => navigation.navigate('GroupSettings', { groupId })} />
    </Screen>
  );
};
