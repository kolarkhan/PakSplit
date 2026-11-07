import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useMemo, useState } from 'react';
import { NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { Image, Pressable, Text, View } from 'react-native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { BalancePill } from '../../components/common/BalancePill';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import { ExpenseCard } from '../../components/expense/ExpenseCard';
import {
  useApproveJoinRequestMutation,
  useDeclineJoinRequestMutation,
  useExpensesByGroupQuery,
  useGroupBalanceQuery,
  useGroupByIdQuery,
  useGroupsQuery,
  useRemoveGroupMemberMutation,
  useUpdateGroupMemberAvailabilityMutation,
  useUpdateGroupMemberRoleMutation,
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

const isCurrentlyUnavailable = (member: { availabilityStatus?: 'active' | 'unavailable'; unavailableUntil?: string }) => {
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

  return new Intl.DateTimeFormat('en-PK', { dateStyle: 'medium' }).format(new Date(value));
};


export const GroupDetailsScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<Record<string, { groupId?: string } | undefined>, string>>();
  const fallbackGroups = useAppSelector((state) => state.groups.items);
  const fallbackExpenses = useAppSelector((state) => state.expenses.items);
  const sessionUser = useAppSelector((state) => state.session.user);
  const { show } = useToast();
  const selectedGroupId = route.params?.groupId;
  const [isMembersVisible, setIsMembersVisible] = useState(true);
  const [isExpensesVisible, setIsExpensesVisible] = useState(true);
  const [openMemberMenuId, setOpenMemberMenuId] = useState<string | null>(null);
  const [activeMemberActionKey, setActiveMemberActionKey] = useState<string | null>(null);

  const { data: groupsData, isLoading: groupsLoading, isFetching: groupsFetching, isError: groupsError } = useGroupsQuery();
  const { data: groupDetailsData, isLoading: groupDetailsLoading } = useGroupByIdQuery(selectedGroupId ?? '', {
    skip: !selectedGroupId,
  });
  const { data: groupBalanceData } = useGroupBalanceQuery(selectedGroupId ?? '', {
    skip: !selectedGroupId,
  });
  const [approveJoinRequest, { isLoading: approvingRequest }] = useApproveJoinRequestMutation();
  const [declineJoinRequest, { isLoading: decliningRequest }] = useDeclineJoinRequestMutation();
  const [updateGroupMemberRole] = useUpdateGroupMemberRoleMutation();
  const [updateGroupMemberAvailability] = useUpdateGroupMemberAvailabilityMutation();
  const [removeGroupMember] = useRemoveGroupMemberMutation();
  const serverGroup = groupDetailsData?.data ?? groupsData?.data.find((item) => item._id === selectedGroupId);

  const group = useMemo(() => {
    if (serverGroup) {
      return {
        id: serverGroup._id,
        name: serverGroup.name,
        description: serverGroup.description ?? 'No description added yet.',
        balance: groupBalanceData?.data?.summary?.netBalance ?? serverGroup.balance ?? 0,
        youOwe: groupBalanceData?.data?.summary?.youOwe ?? 0,
        youAreOwed: groupBalanceData?.data?.summary?.youAreOwed ?? 0,
        inviteCode: serverGroup.inviteCode,
        members: serverGroup.members ?? [],
      };
    }

    if (groupsError) {
      const fallback = fallbackGroups.find((item) => item.id === selectedGroupId) ?? fallbackGroups[0];
      if (!fallback) {
        return undefined;
      }

      return {
        id: fallback.id,
        name: fallback.name,
        description: fallback.description,
        balance: fallback.balance,
        youOwe: 0,
        youAreOwed: 0,
        inviteCode: fallback.inviteCode,
        members: [],
      };
    }

    return undefined;
  }, [fallbackGroups, groupBalanceData?.data?.summary?.netBalance, groupBalanceData?.data?.summary?.youAreOwed, groupBalanceData?.data?.summary?.youOwe, groupsError, selectedGroupId, serverGroup]);

  const { data: expensesData, isLoading: expensesLoading } = useExpensesByGroupQuery(serverGroup?._id ?? '', {
    skip: !serverGroup?._id,
  });

  const expenses = useMemo(() => {
    if (serverGroup) {
      return expensesData?.data ?? [];
    }

    if (groupsError && group) {
      return fallbackExpenses.filter((expense) => expense.groupId === group.id);
    }

    return [];
  }, [expensesData?.data, fallbackExpenses, group, groupsError, serverGroup]);

  const activeMembers = useMemo(() => {
    return (group?.members ?? [])
      .filter((member) => member.status === 'active')
      .map((member, index) => {
        const userRef = member.userId;
        const isObject = typeof userRef === 'object' && userRef !== null;
        const memberId = isObject ? userRef._id : userRef;
        const isYou = sessionUser?._id === memberId;
        const fullName = isObject
          ? userRef.fullName
          : isYou
            ? sessionUser?.fullName ?? 'You'
            : `Member ${index + 1}`;
        const avatarInitial = fullName.charAt(0).toUpperCase();

        return {
          id: String(memberId),
          fullName,
          avatarInitial,
          avatarUrl: isObject ? userRef.avatarUrl : isYou ? sessionUser?.avatarUrl : undefined,
          role: member.role,
          isYou,
          availabilityStatus: member.availabilityStatus,
          unavailableUntil: member.unavailableUntil,
          availabilityNote: member.availabilityNote,
          excludeFromNewExpenses: member.excludeFromNewExpenses,
        };
      });
  }, [group?.members, sessionUser?._id, sessionUser?.avatarUrl, sessionUser?.fullName]);

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

  const isCurrentUserAdmin = useMemo(() => {
    return (group?.members ?? []).some((member) => {
      const userRef = member.userId;
      const memberId = typeof userRef === 'object' && userRef !== null ? userRef._id : userRef;
      return memberId === sessionUser?._id && member.status === 'active' && member.role === 'admin';
    });
  }, [group?.members, sessionUser?._id]);

  const activeAdminCount = useMemo(() => activeMembers.filter((member) => member.role === 'admin').length, [activeMembers]);
  const unavailableCount = useMemo(() => activeMembers.filter((member) => isCurrentlyUnavailable(member)).length, [activeMembers]);

  const handleCopyInviteCode = async () => {
    if (!group?.inviteCode) {
      return;
    }

    await Clipboard.setStringAsync(group.inviteCode);
    show('Invite code copied', { tone: 'success' });
  };

  const handleApproveRequest = async (userId: string, fullName: string) => {
    if (!group) {
      return;
    }

    try {
      await approveJoinRequest({ groupId: group.id, userId }).unwrap();
      show(`${fullName} added to the group`, { tone: 'success' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not approve this request'), { tone: 'error' });
    }
  };

  const handleDeclineRequest = async (userId: string, fullName: string) => {
    if (!group) {
      return;
    }

    try {
      await declineJoinRequest({ groupId: group.id, userId }).unwrap();
      show(`${fullName}'s request was declined`, { tone: 'info' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not decline this request'), { tone: 'error' });
    }
  };

  const handleRoleUpdate = async (userId: string, role: 'admin' | 'member', fullName: string) => {
    if (!group) {
      return;
    }

    try {
      setActiveMemberActionKey(`role-${userId}`);
      await updateGroupMemberRole({ groupId: group.id, userId, role }).unwrap();
      setOpenMemberMenuId(null);
      show(`${fullName} is now ${role}`, { tone: 'success' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not update member role'), { tone: 'error' });
    } finally {
      setActiveMemberActionKey(null);
    }
  };

  const handleAvailabilityUpdate = async (
    userId: string,
    fullName: string,
    payload:
      | { availabilityStatus: 'active' }
      | { availabilityStatus: 'unavailable'; unavailableUntil?: string; availabilityNote: string; excludeFromNewExpenses: boolean },
  ) => {
    if (!group) {
      return;
    }

    try {
      setActiveMemberActionKey(`availability-${userId}`);
      await updateGroupMemberAvailability({ groupId: group.id, userId, ...payload }).unwrap();
      setOpenMemberMenuId(null);
      show(
        payload.availabilityStatus === 'unavailable'
          ? `${fullName} marked unavailable`
          : `${fullName} is active again`,
        { tone: payload.availabilityStatus === 'unavailable' ? 'info' : 'success' },
      );
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not update availability'), { tone: 'error' });
    } finally {
      setActiveMemberActionKey(null);
    }
  };

  const handleRemoveMember = async (userId: string, fullName: string) => {
    if (!group) {
      return;
    }

    try {
      setActiveMemberActionKey(`remove-${userId}`);
      await removeGroupMember({ groupId: group.id, userId }).unwrap();
      setOpenMemberMenuId(null);
      show(`${fullName} removed from the group`, { tone: 'info' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not remove this member'), { tone: 'error' });
    } finally {
      setActiveMemberActionKey(null);
    }
  };

  if (groupsLoading || groupDetailsLoading || (Boolean(selectedGroupId) && !serverGroup && groupsFetching && !groupsError)) {
    return (
      <Screen>
        <AppCard>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Loading group details...</Text>
        </AppCard>
      </Screen>
    );
  }

  if (!group) {
    return (
      <Screen>
        <EmptyState title="Group not found" subtitle="This group could not be loaded. Go back to the groups list and try another card." />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppCard style={{ backgroundColor: theme.mode === 'dark' ? '#10253A' : '#16324F', borderColor: 'rgba(255,255,255,0.08)' }}>
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: theme.spacing.md }}>
            <View style={{ flex: 1, gap: 10 }}>
              <Text style={[theme.typography.h1, { color: '#F5FAFF' }]}>{group.name}</Text>
              <Text style={[theme.typography.body, { color: '#B8CAE0' }]}>{group.description}</Text>
              <BalancePill amount={Math.abs(group.balance)} positive={group.balance >= 0} />
              <View style={{ flexDirection: 'row', gap: theme.spacing.md, flexWrap: 'wrap' }}>
                <Text style={[theme.typography.caption, { color: '#D4E5F7' }]}>You owe: {Math.abs(group.youOwe ?? 0) > 0 ? `PKR ${Math.round(group.youOwe ?? 0).toLocaleString('en-PK')}` : 'PKR 0'}</Text>
                <Text style={[theme.typography.caption, { color: '#D4E5F7' }]}>You are owed: {Math.abs(group.youAreOwed ?? 0) > 0 ? `PKR ${Math.round(group.youAreOwed ?? 0).toLocaleString('en-PK')}` : 'PKR 0'}</Text>
                {unavailableCount > 0 ? <Text style={[theme.typography.caption, { color: '#FFD27A' }]}>{unavailableCount} member{unavailableCount === 1 ? '' : 's'} unavailable</Text> : null}
              </View>
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                <Pressable
                  onPress={() => void handleCopyInviteCode()}
                  style={{
                    alignSelf: 'flex-start',
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: theme.radius.pill,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.xs,
                  }}
                >
                  <Ionicons name="copy-outline" size={14} color="#EAF4FF" />
                  <Text style={[theme.typography.caption, { color: '#EAF4FF' }]}>Invite code: {group.inviteCode}</Text>
                </Pressable>
              </View>
            </View>
            <Pressable
              onPress={() => navigation.navigate('GroupSettings', { groupId: group.id })}
              style={({ pressed }) => ({
                width: 40,
                height: 40,
                borderRadius: theme.radius.pill,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.12)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.16)',
                opacity: pressed ? 0.88 : 1,
              })}
            >
              <Ionicons name="settings-outline" size={18} color="#EAF4FF" />
            </Pressable>
          </View>
        </View>
      </AppCard>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <View style={{ flex: 1 }}>
          <AppButton label="Add Expense" onPress={() => navigation.navigate('AddExpense', { groupId: group.id })} />
        </View>
        <View style={{ flex: 1 }}>
          <AppButton label="Invite Member" variant="secondary" onPress={() => navigation.navigate('InviteMember', { groupId: group.id })} />
        </View>
      </View>

      <AppButton label="View Activity" variant="secondary" onPress={() => navigation.navigate('GroupActivity', { groupId: group.id })} />

      {isCurrentUserAdmin && pendingRequests.length > 0 ? (
        <View style={{ gap: theme.spacing.sm }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Pending join requests</Text>
          <AppCard style={{ gap: theme.spacing.md }}>
            {pendingRequests.map((request) => (
              <View key={request.id} style={{ gap: theme.spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
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
                    <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Waiting for admin approval</Text>
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
              </View>
            ))}
          </AppCard>
        </View>
      ) : null}

      <View style={{ gap: theme.spacing.sm }}>
        <Pressable
          onPress={() => setIsMembersVisible((current) => !current)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.md,
          }}
        >
          <View style={{ gap: 2 }}>
            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Members</Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Tap to {isMembersVisible ? 'hide' : 'show'} group members</Text>
          </View>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: theme.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : '#EAF2FF',
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Ionicons name={isMembersVisible ? 'chevron-up-outline' : 'chevron-down-outline'} size={18} color={theme.colors.text} />
          </View>
        </Pressable>
        {isMembersVisible ? (
          activeMembers.length > 0 ? (
            <AppCard style={{ gap: theme.spacing.md }}>
              {activeMembers.map((member) => {
                const showMemberMenu = openMemberMenuId === member.id;
                const canManage = isCurrentUserAdmin && !member.isYou;
                const canPromote = member.role === 'member';
                const canDemote = member.role === 'admin' && activeAdminCount > 1;
                const roleActionLoading = activeMemberActionKey === `role-${member.id}`;
                const availabilityActionLoading = activeMemberActionKey === `availability-${member.id}`;
                const removeActionLoading = activeMemberActionKey === `remove-${member.id}`;
                const unavailable = isCurrentlyUnavailable(member);

                return (
                  <View key={member.id} style={{ gap: theme.spacing.sm }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: theme.spacing.md,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
                        <View
                          style={{
                            width: 40,
                            height: 40,
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
                          <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]} numberOfLines={1}>
                            {member.fullName}{member.isYou ? ' (You)' : ''}
                          </Text>
                          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
                            {unavailable
                              ? `Unavailable ${formatUntil(member.unavailableUntil)}`
                              : member.isYou
                                ? 'This is your member profile in the group.'
                                : 'Active member in this group.'}
                          </Text>
                          {member.availabilityNote && unavailable ? (
                            <Text style={[theme.typography.caption, { color: theme.colors.warning }]}>{member.availabilityNote}</Text>
                          ) : null}
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
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
                            <Text style={[theme.typography.caption, { color: theme.colors.warning }]}>Away</Text>
                          </View>
                        ) : null}
                        {canManage ? (
                          <Pressable
                            onPress={() => setOpenMemberMenuId((current) => current === member.id ? null : member.id)}
                            style={({ pressed }) => ({
                              width: 34,
                              height: 34,
                              borderRadius: theme.radius.pill,
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : '#EEF4FB',
                              borderWidth: 1,
                              borderColor: theme.colors.border,
                              opacity: pressed ? 0.88 : 1,
                            })}
                          >
                            <Ionicons name="ellipsis-horizontal" size={18} color={theme.colors.textMuted} />
                          </Pressable>
                        ) : null}
                      </View>
                    </View>

                    {showMemberMenu ? (
                      <View
                        style={{
                          borderRadius: theme.radius.lg,
                          backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : '#F5F9FD',
                          borderWidth: 1,
                          borderColor: theme.colors.border,
                          padding: theme.spacing.sm,
                          gap: theme.spacing.sm,
                        }}
                      >
                        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Quick actions for {member.fullName}</Text>
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
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </AppCard>
          ) : (
            <EmptyState
              title="Members will appear here"
              subtitle="Once this group is synced from MongoDB with active member profiles, their names and roles will show here."
            />
          )
        ) : null}
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <Pressable
          onPress={() => setIsExpensesVisible((current) => !current)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.md,
          }}
        >
          <View style={{ gap: 2 }}>
            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Recent expenses</Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Tap to {isExpensesVisible ? 'hide' : 'show'} expense history</Text>
          </View>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: theme.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : '#EAF2FF',
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Ionicons name={isExpensesVisible ? 'chevron-up-outline' : 'chevron-down-outline'} size={18} color={theme.colors.text} />
          </View>
        </Pressable>
        {isExpensesVisible ? (
          expensesLoading ? (
            <AppCard>
              <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Loading expenses...</Text>
            </AppCard>
          ) : expenses.length > 0 ? (
            <View style={{ gap: theme.spacing.sm }}>
              {expenses.map((expense) => (
                <ExpenseCard key={'_id' in expense ? expense._id : expense.id} {...expense} />
              ))}
            </View>
          ) : (
            <EmptyState
              title="No expenses yet"
              subtitle="This group is ready. Next step is to add the first expense or invite more members before settling balances."
            />
          )
        ) : null}
      </View>
    </Screen>
  );
};
