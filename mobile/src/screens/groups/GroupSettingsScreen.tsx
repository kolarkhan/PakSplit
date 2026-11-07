import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import {
  useDeleteGroupMutation,
  useGroupByIdQuery,
  useGroupBalanceQuery,
  useUpdateGroupMutation,
} from '../../store/api/baseApi';
import { useAppSelector } from '../../store/hooks';
import { useAppTheme } from '../../theme/theme';
import { getApiErrorMessage } from '../../utils/apiError';

const SettingsRow = ({
  icon,
  title,
  description,
  onPress,
  tone = 'default',
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  onPress?: () => void;
  tone?: 'default' | 'danger';
}) => {
  const theme = useAppTheme();
  const iconColor = tone === 'danger' ? theme.colors.danger : theme.colors.primary;
  const iconBackground = tone === 'danger'
    ? theme.mode === 'dark' ? '#3A161C' : '#FDECEC'
    : theme.mode === 'dark' ? '#10263A' : '#EAF2FF';

  return (
    <Pressable disabled={!onPress} onPress={onPress}>
      {({ pressed }) => (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: theme.spacing.md,
            opacity: pressed ? 0.92 : 1,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: theme.radius.md,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: iconBackground,
              }}
            >
              <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[theme.typography.bodyStrong, { color: tone === 'danger' ? theme.colors.danger : theme.colors.text }]}>{title}</Text>
              <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{description}</Text>
            </View>
          </View>
          {onPress ? <Ionicons name="chevron-forward-outline" size={18} color={theme.colors.textMuted} /> : null}
        </View>
      )}
    </Pressable>
  );
};

export const GroupSettingsScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<Record<string, { groupId?: string } | undefined>, string>>();
  const { show } = useToast();
  const sessionUser = useAppSelector((state) => state.session.user);
  const groupId = route.params?.groupId ?? '';

  const { data: groupData, isLoading } = useGroupByIdQuery(groupId, { skip: !groupId });
  const { data: groupBalanceData } = useGroupBalanceQuery(groupId, { skip: !groupId });
  const [updateGroup, { isLoading: saving }] = useUpdateGroupMutation();
  const [deleteGroup, { isLoading: deleting }] = useDeleteGroupMutation();

  const group = groupData?.data;
  const members = group?.members ?? [];
  const activeMembers = members.filter((member) => member.status === 'active');
  const pendingMembers = members.filter((member) => member.status === 'pending');
  const currentMember = members.find((member) => {
    const ref = member.userId;
    const memberId = typeof ref === 'object' && ref !== null ? ref._id : ref;
    return memberId === sessionUser?._id;
  });
  const isAdmin = currentMember?.role === 'admin' && currentMember?.status === 'active';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setName(group?.name ?? '');
    setDescription(group?.description ?? '');
  }, [group?.description, group?.name]);

  const hasChanges = useMemo(() => {
    return name.trim() !== (group?.name ?? '').trim() || description.trim() !== (group?.description ?? '').trim();
  }, [description, group?.description, group?.name, name]);

  const inviteCode = group?.inviteCode ?? 'Unavailable';
  const netBalance = groupBalanceData?.data?.summary?.netBalance ?? group?.balance ?? 0;

  const handleSave = async () => {
    if (!groupId) {
      return;
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (trimmedName.length < 2) {
      show('Group name should be at least 2 characters', { tone: 'error' });
      return;
    }

    try {
      await updateGroup({
        groupId,
        name: trimmedName,
        description: trimmedDescription || undefined,
      }).unwrap();
      show('Group settings updated', { tone: 'success' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not save group settings'), { tone: 'error' });
    }
  };

  const handleDelete = () => {
    if (!groupId || !group) {
      return;
    }

    Alert.alert(
      'Delete group',
      `Are you sure you want to delete ${group.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                await deleteGroup(groupId).unwrap();
                show('Group deleted', { tone: 'success' });
                navigation.navigate('GroupListHome');
              } catch (error) {
                show(getApiErrorMessage(error, 'Could not delete this group'), { tone: 'error' });
              }
            })();
          },
        },
      ],
    );
  };

  const handleCopyInviteCode = async () => {
    await Clipboard.setStringAsync(inviteCode);
    show('Invite code copied', { tone: 'success' });
  };

  const handleComingSoon = (label: string) => {
    show(`${label} will be added in the next pass`, { tone: 'info' });
  };

  if (isLoading || !group) {
    return (
      <Screen>
        <AppCard>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Loading group settings...</Text>
        </AppCard>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ gap: 8 }}>
        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Group Settings</Text>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>{group.name}</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Control group identity, access, invites, and admin-only safety actions from one place.</Text>
      </View>

      <AppCard>
        <View style={{ flexDirection: 'row', gap: theme.spacing.md, flexWrap: 'wrap' }}>
          <View style={{ gap: 4, minWidth: 120 }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Your role</Text>
            <Text style={[theme.typography.bodyStrong, { color: isAdmin ? theme.colors.success : theme.colors.text }]}>{isAdmin ? 'Admin access' : 'Member access'}</Text>
          </View>
          <View style={{ gap: 4, minWidth: 120 }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Members</Text>
            <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{activeMembers.length} active</Text>
          </View>
          <View style={{ gap: 4, minWidth: 120 }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Pending requests</Text>
            <Text style={[theme.typography.bodyStrong, { color: pendingMembers.length > 0 ? theme.colors.warning : theme.colors.text }]}>{pendingMembers.length}</Text>
          </View>
          <View style={{ gap: 4, minWidth: 120 }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Net balance</Text>
            <Text style={[theme.typography.bodyStrong, { color: netBalance >= 0 ? theme.colors.success : theme.colors.danger }]}>PKR {Math.abs(Math.round(netBalance)).toLocaleString('en-PK')}</Text>
          </View>
        </View>
      </AppCard>

      <View style={{ gap: theme.spacing.sm }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Group identity</Text>
        <AppCard style={{ gap: theme.spacing.md }}>
          <AppInput
            label="Group name"
            value={name}
            onChangeText={setName}
            editable={isAdmin}
            placeholder="Murree Trip Crew"
          />
          <AppInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            editable={isAdmin}
            placeholder="Add a short note for this group"
            multiline
            numberOfLines={4}
            style={{ minHeight: 110, textAlignVertical: 'top', paddingTop: 16 }}
          />
          {isAdmin ? (
            <AppButton label={hasChanges ? 'Save changes' : 'Saved'} onPress={() => void handleSave()} disabled={!hasChanges} loading={saving} />
          ) : (
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Only admins can update group info.</Text>
          )}
        </AppCard>
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Access and invites</Text>
        <AppCard style={{ gap: theme.spacing.md }}>
          <Pressable
            onPress={() => void handleCopyInviteCode()}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderRadius: theme.radius.lg,
              backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : '#EAF2FF',
              borderWidth: 1,
              borderColor: theme.colors.border,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: theme.spacing.sm,
            }}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Invite code</Text>
              <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{inviteCode}</Text>
            </View>
            <Ionicons name="copy-outline" size={18} color={theme.colors.primary} />
          </Pressable>
          <View style={{ gap: 4 }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Join approval</Text>
            <Text style={[theme.typography.bodyStrong, { color: theme.colors.success }]}>Enabled for this group</Text>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Default currency</Text>
            <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>PKR</Text>
          </View>
        </AppCard>
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Quick actions</Text>
        <AppCard style={{ gap: theme.spacing.md }}>
          <SettingsRow
            icon="people-outline"
            title="Manage members"
            description="See members, roles, and invite status for this group."
            onPress={() => navigation.navigate('GroupMembers', { groupId })}
          />
          <SettingsRow
            icon="person-add-outline"
            title="Pending join requests"
            description={pendingMembers.length > 0 ? `${pendingMembers.length} request(s) waiting for admin review.` : 'No pending requests right now.'}
            onPress={() => navigation.navigate('GroupPendingRequests', { groupId })}
          />

          <SettingsRow
            icon="shield-checkmark-outline"
            title="Permissions"
            description="Admin approvals are required for new join requests."
            onPress={() => handleComingSoon('Advanced permissions')}
          />
        </AppCard>
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Safety</Text>
        <AppCard style={{ gap: theme.spacing.md }}>
          {isAdmin ? (
            <SettingsRow
              icon="trash-outline"
              title="Delete group"
              description="Delete this group and its active workflow from your app."
              onPress={handleDelete}
              tone="danger"
            />
          ) : (
            <SettingsRow
              icon="exit-outline"
              title="Leave group"
              description="Member self-leave will be added after safe admin transfer support."
              onPress={() => handleComingSoon('Leave group')}
              tone="danger"
            />
          )}
          {deleting ? <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Deleting group...</Text> : null}
        </AppCard>
      </View>
    </Screen>
  );
};


