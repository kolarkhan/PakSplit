import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import {
  useGroupByIdQuery,
  useRemoveGroupMemberMutation,
  useUpdateGroupMemberAvailabilityMutation,
  useUpdateGroupMemberRoleMutation,
} from '../../store/api/baseApi';
import { useAppSelector } from '../../store/hooks';
import { useAppTheme } from '../../theme/theme';
import { getApiErrorMessage } from '../../utils/apiError';

const MemberActionButton = ({
  label,
  tone,
  disabled,
  loading,
  onPress,
}: {
  label: string;
  tone: 'primary' | 'danger' | 'warning' | 'success';
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
}) => {
  const theme = useAppTheme();
  const backgroundColor =
    tone === 'danger'
      ? theme.colors.danger
      : tone === 'warning'
        ? theme.colors.warning
        : tone === 'success'
          ? theme.colors.success
          : theme.colors.primary;

  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 40,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
        opacity: disabled || loading ? 0.55 : pressed ? 0.9 : 1,
      })}
    >
      <Text style={[theme.typography.caption, { color: '#FFFFFF' }]}>{loading ? `${label}...` : label}</Text>
    </Pressable>
  );
};

const isCurrentlyUnavailable = (member: {
  availabilityStatus?: 'active' | 'unavailable';
  unavailableUntil?: string;
}) => {
  if (member.availabilityStatus !== 'unavailable') {
    return false;
  }

  if (!member.unavailableUntil) {
    return true;
  }

  return new Date(member.unavailableUntil).getTime() > Date.now();
};

const formatUntil = (value?: string) => {
  if (!value) {
    return 'until further notice';
  }

  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
  }).format(new Date(value));
};

export const GroupMembersScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<Record<string, { groupId?: string } | undefined>, string>>();
  const { show } = useToast();
  const sessionUser = useAppSelector((state) => state.session.user);
  const groupId = route.params?.groupId ?? '';
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null);

  const { data, isLoading } = useGroupByIdQuery(groupId, { skip: !groupId });
  const [updateGroupMemberRole] = useUpdateGroupMemberRoleMutation();
  const [updateGroupMemberAvailability] = useUpdateGroupMemberAvailabilityMutation();
  const [removeGroupMember] = useRemoveGroupMemberMutation();

  const group = data?.data;
  const members = group?.members ?? [];

  const mappedMembers = useMemo(() => {
    return members.map((member, index) => {
      const userRef = member.userId;
      const isObject = typeof userRef === 'object' && userRef !== null;
      const memberId = isObject ? userRef._id : userRef;
      const isYou = memberId === sessionUser?._id;
      const fullName = isObject ? userRef.fullName : isYou ? sessionUser?.fullName ?? 'You' : `Member ${index + 1}`;

      return {
        id: String(memberId),
        fullName,
        avatarUrl: isObject ? userRef.avatarUrl : isYou ? sessionUser?.avatarUrl : undefined,
        avatarInitial: fullName.charAt(0).toUpperCase(),
        role: member.role,
        status: member.status,
        isYou,
        availabilityStatus: member.availabilityStatus,
        unavailableUntil: member.unavailableUntil,
        availabilityNote: member.availabilityNote,
        excludeFromNewExpenses: member.excludeFromNewExpenses,
      };
    });
  }, [members, sessionUser?._id, sessionUser?.avatarUrl, sessionUser?.fullName]);

  const activeMembers = mappedMembers.filter((member) => member.status === 'active');
  const unavailableCount = activeMembers.filter((member) => isCurrentlyUnavailable(member)).length;
  const pendingMembers = mappedMembers.filter((member) => member.status === 'pending');
  const removedMembers = mappedMembers.filter((member) => member.status === 'removed');
  const currentMember = activeMembers.find((member) => member.isYou);
  const isAdmin = currentMember?.role === 'admin';
  const activeAdminCount = activeMembers.filter((member) => member.role === 'admin').length;

  const handleRoleUpdate = async (userId: string, role: 'admin' | 'member', fullName: string) => {
    if (!groupId) {
      return;
    }

    try {
      setActiveActionKey(`role-${userId}`);
      await updateGroupMemberRole({ groupId, userId, role }).unwrap();
      show(`${fullName} is now ${role}`, { tone: 'success' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not update member role'), { tone: 'error' });
    } finally {
      setActiveActionKey(null);
    }
  };

  const handleAvailabilityUpdate = async (
    userId: string,
    fullName: string,
    payload:
      | { availabilityStatus: 'active' }
      | { availabilityStatus: 'unavailable'; unavailableUntil?: string; availabilityNote: string; excludeFromNewExpenses: boolean },
  ) => {
    if (!groupId) {
      return;
    }

    try {
      setActiveActionKey(`availability-${userId}`);
      await updateGroupMemberAvailability({ groupId, userId, ...payload }).unwrap();
      show(
        payload.availabilityStatus === 'unavailable'
          ? `${fullName} marked unavailable`
          : `${fullName} is active again`,
        { tone: payload.availabilityStatus === 'unavailable' ? 'info' : 'success' },
      );
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not update availability'), { tone: 'error' });
    } finally {
      setActiveActionKey(null);
    }
  };

  const handleRemoveMember = async (userId: string, fullName: string) => {
    if (!groupId) {
      return;
    }

    try {
      setActiveActionKey(`remove-${userId}`);
      await removeGroupMember({ groupId, userId }).unwrap();
      show(`${fullName} removed from the group`, { tone: 'info' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not remove this member'), { tone: 'error' });
    } finally {
      setActiveActionKey(null);
    }
  };

  if (isLoading || !group) {
    return (
      <Screen>
        <AppCard>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Loading group members...</Text>
        </AppCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: 8 }}>
        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Members</Text>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>{group.name}</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Manage roles, temporary availability, and member access in one place.</Text>
      </View>

      <AppCard>
        <View style={{ flexDirection: 'row', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <View style={{ gap: 4, minWidth: 120 }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Active members</Text>
            <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{activeMembers.length}</Text>
          </View>
          <View style={{ gap: 4, minWidth: 120 }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Admins</Text>
            <Text style={[theme.typography.bodyStrong, { color: theme.colors.success }]}>{activeAdminCount}</Text>
          </View>
          <View style={{ gap: 4, minWidth: 120 }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Unavailable</Text>
            <Text style={[theme.typography.bodyStrong, { color: unavailableCount > 0 ? theme.colors.warning : theme.colors.text }]}>{unavailableCount}</Text>
          </View>
          <View style={{ gap: 4, minWidth: 120 }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Pending</Text>
            <Text style={[theme.typography.bodyStrong, { color: pendingMembers.length > 0 ? theme.colors.warning : theme.colors.text }]}>{pendingMembers.length}</Text>
          </View>
        </View>
      </AppCard>

      <View style={{ gap: theme.spacing.sm }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Active members</Text>
        {activeMembers.length > 0 ? (
          activeMembers.map((member) => {
            const roleActionLoading = activeActionKey === `role-${member.id}`;
            const availabilityActionLoading = activeActionKey === `availability-${member.id}`;
            const removeActionLoading = activeActionKey === `remove-${member.id}`;
            const canDemote = member.role === 'admin' && activeAdminCount > 1;
            const canPromote = member.role === 'member';
            const canManage = isAdmin && !member.isYou;
            const unavailable = isCurrentlyUnavailable(member);

            return (
              <AppCard key={member.id} style={{ gap: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: theme.radius.pill,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : '#EAF2FF',
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      overflow: 'hidden',
                    }}
                  >
                    {member.avatarUrl ? (
                      <Image source={{ uri: member.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{member.avatarInitial}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{member.fullName}{member.isYou ? ' (You)' : ''}</Text>
                    <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                      {unavailable
                        ? `Unavailable ${formatUntil(member.unavailableUntil)}${member.excludeFromNewExpenses ? ' � hidden from new splits' : ''}`
                        : member.role === 'admin'
                          ? 'Admin controls enabled for this member.'
                          : 'Standard member access.'}
                    </Text>
                    {member.availabilityNote && unavailable ? (
                      <Text style={[theme.typography.caption, { color: theme.colors.warning }]}>{member.availabilityNote}</Text>
                    ) : null}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: theme.spacing.xs }}>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: theme.radius.pill,
                        backgroundColor: member.role === 'admin' ? (theme.mode === 'dark' ? '#173047' : '#EAF4FF') : theme.colors.surfaceMuted,
                      }}
                    >
                      <Text style={[theme.typography.caption, { color: member.role === 'admin' ? theme.colors.primary : theme.colors.textMuted }]}>
                        {member.role === 'admin' ? 'Admin' : 'Member'}
                      </Text>
                    </View>
                    {unavailable ? (
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: theme.radius.pill,
                          backgroundColor: theme.mode === 'dark' ? '#3A2C12' : '#FFF4E0',
                        }}
                      >
                        <Text style={[theme.typography.caption, { color: theme.colors.warning }]}>Unavailable</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {canManage ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                    {canPromote ? (
                      <MemberActionButton
                        label="Promote to admin"
                        tone="primary"
                        onPress={() => void handleRoleUpdate(member.id, 'admin', member.fullName)}
                        loading={roleActionLoading}
                        disabled={availabilityActionLoading || removeActionLoading}
                      />
                    ) : null}
                    {canDemote ? (
                      <MemberActionButton
                        label="Make member"
                        tone="primary"
                        onPress={() => void handleRoleUpdate(member.id, 'member', member.fullName)}
                        loading={roleActionLoading}
                        disabled={availabilityActionLoading || removeActionLoading}
                      />
                    ) : null}
                    {unavailable ? (
                      <MemberActionButton
                        label="Mark active again"
                        tone="success"
                        onPress={() => void handleAvailabilityUpdate(member.id, member.fullName, { availabilityStatus: 'active' })}
                        loading={availabilityActionLoading}
                        disabled={roleActionLoading || removeActionLoading}
                      />
                    ) : (
                      <MemberActionButton
                        label="Unavailable"
                        tone="warning"
                        onPress={() =>
                          void handleAvailabilityUpdate(member.id, member.fullName, {
                            availabilityStatus: 'unavailable',
                            availabilityNote: 'Temporarily unavailable',
                            excludeFromNewExpenses: true,
                          })
                        }
                        loading={availabilityActionLoading}
                        disabled={roleActionLoading || removeActionLoading}
                      />
                    )}
                    <MemberActionButton
                      label="Remove"
                      tone="danger"
                      onPress={() => void handleRemoveMember(member.id, member.fullName)}
                      loading={removeActionLoading}
                      disabled={roleActionLoading || availabilityActionLoading || (member.role === 'admin' && activeAdminCount <= 1)}
                    />
                  </View>
                ) : member.isYou ? (
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Your own membership stays protected here. An admin can pause your participation temporarily if needed.</Text>
                ) : null}
              </AppCard>
            );
          })
        ) : (
          <EmptyState title="No active members" subtitle="Members will appear here once the group has active participants." />
        )}
      </View>

      {pendingMembers.length > 0 ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Pending join requests</Text>
          <AppCard style={{ gap: theme.spacing.md }}>
            {pendingMembers.map((member) => (
              <View key={member.id} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: theme.radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : '#FFF7E8',
                  }}
                >
                  <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{member.avatarInitial}</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{member.fullName}</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Pending approval from an admin</Text>
                </View>
              </View>
            ))}
            <AppButton label="Open pending requests" variant="secondary" onPress={() => navigation.navigate('GroupPendingRequests', { groupId })} />
          </AppCard>
        </View>
      ) : null}

      {removedMembers.length > 0 ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Removed members</Text>
          <AppCard style={{ gap: theme.spacing.sm }}>
            {removedMembers.map((member) => (
              <View key={member.id} style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <Ionicons name="person-remove-outline" size={18} color={theme.colors.textMuted} />
                <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{member.fullName}</Text>
              </View>
            ))}
          </AppCard>
        </View>
      ) : null}
    </Screen>
  );
};
