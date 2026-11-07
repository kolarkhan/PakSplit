import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppCard } from '../../components/common/AppCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import {
  useApproveJoinRequestMutation,
  useDeclineJoinRequestMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
} from '../../store/api/baseApi';
import type { AppNotification } from '../../types/models';
import { useAppTheme } from '../../theme/theme';
import { getApiErrorMessage } from '../../utils/apiError';

const formatTime = (value: string) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const notificationTone = (notification: AppNotification) => {
  if (notification.type.includes('settlement')) {
    return { icon: 'swap-horizontal-outline' as const, color: '#B45309', background: '#FEF3C7' };
  }

  if (notification.type.includes('expense')) {
    return { icon: 'receipt-outline' as const, color: '#7C3AED', background: '#EDE9FE' };
  }

  if (notification.type.includes('member')) {
    return { icon: 'people-outline' as const, color: '#15803D', background: '#DCFCE7' };
  }

  return { icon: 'notifications-outline' as const, color: '#1D4ED8', background: '#DBEAFE' };
};

const getJoinRequestPayload = (notification: AppNotification) => {
  if (notification.type !== 'member_request') {
    return null;
  }

  const groupId = typeof notification.metadata?.groupId === 'string' ? notification.metadata.groupId : undefined;
  const requesterUserId = typeof notification.metadata?.requesterUserId === 'string' ? notification.metadata.requesterUserId : undefined;
  const requesterName = typeof notification.metadata?.requesterName === 'string' ? notification.metadata.requesterName : 'This member';

  if (!groupId || !requesterUserId) {
    return null;
  }

  return { groupId, requesterUserId, requesterName };
};

const InlineActionButton = ({
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
        flex: 1,
        minHeight: 44,
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

export const NotificationsScreen = () => {
  const theme = useAppTheme();
  const { show } = useToast();
  const { data, isLoading, isFetching } = useNotificationsQuery();
  const [markRead, { isLoading: markingRead }] = useMarkNotificationReadMutation();
  const [approveJoinRequest, { isLoading: approvingRequest }] = useApproveJoinRequestMutation();
  const [declineJoinRequest, { isLoading: decliningRequest }] = useDeclineJoinRequestMutation();
  const [activeNotificationId, setActiveNotificationId] = useState<string | null>(null);
  const [resolvedRequestIds, setResolvedRequestIds] = useState<Record<string, true>>({});

  const notifications = data?.data ?? [];
  const newNotifications = useMemo(() => notifications.filter((notification) => !notification.isRead), [notifications]);
  const earlierNotifications = useMemo(() => notifications.filter((notification) => notification.isRead), [notifications]);

  const markNotificationAsRead = async (notification: AppNotification) => {
    if (notification.isRead) {
      return;
    }

    await markRead(notification._id).unwrap();
  };

  const handleMarkRead = async (notification: AppNotification) => {
    if (notification.isRead) {
      return;
    }

    try {
      await markNotificationAsRead(notification);
      show('Notification marked as read', { tone: 'success' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Unable to mark notification as read'), { tone: 'error' });
    }
  };

  const handleJoinRequestDecision = async (
    notification: AppNotification,
    decision: 'approve' | 'decline',
  ) => {
    const payload = getJoinRequestPayload(notification);
    if (!payload) {
      show('This join request is missing member details', { tone: 'error' });
      return;
    }

    try {
      setActiveNotificationId(notification._id);
      if (decision === 'approve') {
        await approveJoinRequest({ groupId: payload.groupId, userId: payload.requesterUserId }).unwrap();
      } else {
        await declineJoinRequest({ groupId: payload.groupId, userId: payload.requesterUserId }).unwrap();
      }

      if (!notification.isRead) {
        try {
          await markNotificationAsRead(notification);
        } catch {
          // The primary action already succeeded, so we keep the UX moving.
        }
      }

      setResolvedRequestIds((current) => ({ ...current, [notification._id]: true }));
      show(
        decision === 'approve'
          ? `${payload.requesterName} has been approved`
          : `${payload.requesterName} has been declined`,
        { tone: decision === 'approve' ? 'success' : 'info' },
      );
    } catch (error) {
      show(
        getApiErrorMessage(
          error,
          decision === 'approve' ? 'Could not approve this request' : 'Could not decline this request',
        ),
        { tone: 'error' },
      );
    } finally {
      setActiveNotificationId(null);
    }
  };

  const renderNotificationCard = (notification: AppNotification) => {
    const tone = notificationTone(notification);
    const joinRequestPayload = getJoinRequestPayload(notification);
    const showJoinRequestActions =
      Boolean(joinRequestPayload) && !notification.isRead && !resolvedRequestIds[notification._id];
    const isActingOnThisNotification = activeNotificationId === notification._id;

    return (
      <AppCard
        key={notification._id}
        style={{
          gap: theme.spacing.md,
          borderColor: notification.isRead ? theme.colors.border : theme.colors.primary,
        }}
      >
        <Pressable onPress={() => void handleMarkRead(notification)}>
          {({ pressed }) => (
            <View
              style={{
                flexDirection: 'row',
                gap: theme.spacing.md,
                alignItems: 'flex-start',
                opacity: pressed ? 0.94 : 1,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: theme.radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: tone.background,
                }}
              >
                <Ionicons name={tone.icon} size={20} color={tone.color} />
              </View>

              <View style={{ flex: 1, gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <Text style={[theme.typography.h3, { color: theme.colors.text, flex: 1 }]}>{notification.title}</Text>
                  {!notification.isRead ? (
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: theme.radius.pill,
                        backgroundColor: theme.colors.primary,
                      }}
                    />
                  ) : null}
                </View>
                <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{notification.body}</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>{formatTime(notification.createdAt)}</Text>
                {!notification.isRead ? (
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                    {markingRead ? 'Updating...' : 'Tap to mark as read'}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        </Pressable>

        {showJoinRequestActions ? (
          <View style={{ gap: theme.spacing.sm }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Approve or decline this request directly from notifications.</Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <InlineActionButton
                label="Accept"
                tone="success"
                onPress={() => void handleJoinRequestDecision(notification, 'approve')}
                loading={isActingOnThisNotification && approvingRequest}
                disabled={isActingOnThisNotification && decliningRequest}
              />
              <InlineActionButton
                label="Decline"
                tone="danger"
                onPress={() => void handleJoinRequestDecision(notification, 'decline')}
                loading={isActingOnThisNotification && decliningRequest}
                disabled={isActingOnThisNotification && approvingRequest}
              />
            </View>
          </View>
        ) : null}
      </AppCard>
    );
  };

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg }}>
        {isLoading || isFetching ? (
          <AppCard>
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Loading notifications...</Text>
          </AppCard>
        ) : notifications.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            subtitle="When someone adds an expense or sends a settlement request, it will show up here."
          />
        ) : (
          <View style={{ gap: theme.spacing.lg }}>
            {newNotifications.length > 0 ? (
              <View style={{ gap: theme.spacing.md }}>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>New</Text>
                {newNotifications.map(renderNotificationCard)}
              </View>
            ) : null}

            {earlierNotifications.length > 0 ? (
              <View style={{ gap: theme.spacing.md }}>
                <Text style={[theme.typography.h3, { color: theme.colors.textMuted }]}>Earlier</Text>
                {earlierNotifications.map(renderNotificationCard)}
              </View>
            ) : null}
          </View>
        )}
      </View>
    </Screen>
  );
};
