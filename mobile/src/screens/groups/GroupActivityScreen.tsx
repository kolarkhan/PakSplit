import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Text, View } from 'react-native';

import { AppCard } from '../../components/common/AppCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { useGroupActivityQuery, useGroupsQuery } from '../../store/api/baseApi';
import type { GroupActivity } from '../../types/models';
import { useAppTheme } from '../../theme/theme';

const activityToneMap: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; background: string }> = {
  group_created: { icon: 'sparkles-outline', color: '#0E7490', background: '#E0F2FE' },
  group_updated: { icon: 'create-outline', color: '#1D4ED8', background: '#DBEAFE' },
  member_added: { icon: 'person-add-outline', color: '#15803D', background: '#DCFCE7' },
  member_removed: { icon: 'person-remove-outline', color: '#B91C1C', background: '#FEE2E2' },
  member_role_updated: { icon: 'shield-half-outline', color: '#1D4ED8', background: '#DBEAFE' },
  member_availability_updated: { icon: 'pause-circle-outline', color: '#7C3AED', background: '#EDE9FE' },
  expense_added: { icon: 'receipt-outline', color: '#7C3AED', background: '#EDE9FE' },
  expense_updated: { icon: 'document-text-outline', color: '#7C3AED', background: '#EDE9FE' },
  settlement_recorded: { icon: 'swap-horizontal-outline', color: '#B45309', background: '#FEF3C7' },
  settlement_requested: { icon: 'time-outline', color: '#B45309', background: '#FEF3C7' },
  member_request_submitted: { icon: 'mail-open-outline', color: '#1D4ED8', background: '#DBEAFE' },
  member_request_approved: { icon: 'checkmark-done-outline', color: '#15803D', background: '#DCFCE7' },
  member_request_declined: { icon: 'close-circle-outline', color: '#B91C1C', background: '#FEE2E2' },
};

const formatTime = (value: string) => {
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const getActivityCopy = (activity: GroupActivity) => {
  const metadata = activity.metadata ?? {};

  switch (activity.type) {
    case 'group_created':
      return {
        title: 'Group created',
        subtitle: typeof metadata.name === 'string' ? `${metadata.name} is now ready for members and expenses.` : 'This group has been created and is ready to use.',
      };
    case 'group_updated':
      return {
        title: 'Group details updated',
        subtitle: 'The group profile or settings were updated.',
      };
    case 'member_added':
      return {
        title: 'Member added',
        subtitle: typeof metadata.targetUserId === 'string' ? 'A new member was added to the group.' : 'A member joined this group.',
      };
    case 'member_removed':
      return {
        title: 'Member removed',
        subtitle: 'A member was removed from this group.',
      };
    case 'member_role_updated':
      return {
        title: 'Member role updated',
        subtitle: typeof metadata.role === 'string' ? `A member role was changed to ${metadata.role}.` : 'A member role was updated.',
      };
    case 'member_request_submitted':
      return {
        title: 'Join request submitted',
        subtitle: 'A user requested access to this group and is waiting for admin approval.',
      };
    case 'member_request_approved':
      return {
        title: 'Join request approved',
        subtitle: 'An admin approved a pending join request.',
      };
    case 'member_request_declined':
      return {
        title: 'Join request declined',
        subtitle: 'An admin declined a pending join request.',
      };
    case 'member_availability_updated':
      return {
        title: metadata.availabilityStatus === 'unavailable' ? 'Member marked unavailable' : 'Member restored to active',
        subtitle:
          metadata.availabilityStatus === 'unavailable'
            ? typeof metadata.unavailableUntil === 'string'
              ? `A member is temporarily unavailable until ${new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium' }).format(new Date(metadata.unavailableUntil))}.`
              : 'A member is temporarily unavailable for upcoming group activity.'
            : 'A member is active in the group again.',
      };
    case 'expense_added':
      return {
        title: 'Expense added',
        subtitle:
          typeof metadata.title === 'string' && typeof metadata.totalAmount === 'number'
            ? `${metadata.title} was recorded for PKR ${metadata.totalAmount.toLocaleString('en-PK')}.`
            : 'A new expense was added to the group.',
      };
    case 'expense_updated':
      return {
        title: 'Expense updated',
        subtitle: 'An existing expense was edited.',
      };
    case 'settlement_recorded':
      return {
        title: 'Settlement recorded',
        subtitle:
          typeof metadata.amount === 'number' && typeof metadata.method === 'string'
            ? `A settlement of PKR ${metadata.amount.toLocaleString('en-PK')} was recorded via ${metadata.method}.`
            : 'A settlement entry was added.',
      };
    case 'settlement_requested':
      return {
        title: 'Settlement requested',
        subtitle: 'A settlement request is waiting for confirmation.',
      };
    default:
      return {
        title: activity.type.replace(/_/g, ' '),
        subtitle: 'A new activity event was recorded for this group.',
      };
  }
};

export const GroupActivityScreen = () => {
  const theme = useAppTheme();
  const route = useRoute<RouteProp<Record<string, { groupId?: string } | undefined>, string>>();
  const groupId = route.params?.groupId;

  const { data: groupsData } = useGroupsQuery();
  const { data: activityData, isLoading, isFetching } = useGroupActivityQuery(groupId ?? '', {
    skip: !groupId,
  });

  const group = useMemo(
    () => groupsData?.data.find((item) => item._id === groupId),
    [groupId, groupsData?.data],
  );

  const items = activityData?.data ?? [];

  if (!groupId) {
    return (
      <Screen>
        <EmptyState title="Group not found" subtitle="Open a valid group first, then view its activity timeline." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: 8 }}>
        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Timeline</Text>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Group activity</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}> 
          {group ? `Recent actions inside ${group.name}.` : 'Recent actions inside this group.'}
        </Text>
      </View>

      {isLoading || isFetching ? (
        <AppCard>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Loading activity timeline...</Text>
        </AppCard>
      ) : items.length === 0 ? (
        <EmptyState
          title="No activity yet"
          subtitle="Once members are added, expenses are saved, or settlements are recorded, they will appear here."
        />
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          {items.map((activity) => {
            const tone = activityToneMap[activity.type] ?? {
              icon: 'flash-outline',
              color: theme.colors.primary,
              background: theme.mode === 'dark' ? '#1A2A3A' : '#EAF4FF',
            };
            const copy = getActivityCopy(activity);

            return (
              <AppCard key={activity._id} style={{ gap: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', gap: theme.spacing.md, alignItems: 'flex-start' }}>
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
                    <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{copy.title}</Text>
                    <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{copy.subtitle}</Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>{formatTime(activity.createdAt)}</Text>
                  </View>
                </View>
              </AppCard>
            );
          })}
        </View>
      )}
    </Screen>
  );
};
