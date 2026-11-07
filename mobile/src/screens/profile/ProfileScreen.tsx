import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useMemo } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { tokenStorage } from '../../services/tokenStorage';
import { preferencesStorage } from '../../services/preferencesStorage';
import { api, useNotificationsQuery, useGroupsQuery, useOverallBalanceQuery } from '../../store/api/baseApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearSession, setCurrentUser } from '../../store/slices/sessionSlice';
import { useAppTheme } from '../../theme/theme';
import { formatCurrency } from '../../utils/currency';
import { useToast } from '../../components/common/ToastProvider';

const maskEmail = (value?: string) => {
  if (!value) {
    return 'Not added yet';
  }

  const [name, domain] = value.split('@');
  if (!domain) {
    return value;
  }

  const visible = name.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(name.length - 2, 2))}@${domain}`;
};

const maskPhone = (value?: string) => {
  if (!value) {
    return 'Not added yet';
  }

  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) {
    return value;
  }

  return `+92 ******${digits.slice(-4)}`;
};

const profilePaymentMethods = [
  { label: 'EasyPaisa', value: 'Configured', icon: 'phone-portrait-outline' as const },
  { label: 'JazzCash', value: 'Add details', icon: 'wallet-outline' as const },
  { label: 'Bank / Raast', value: 'Ready for setup', icon: 'card-outline' as const },
];

export const ProfileScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const dispatch = useAppDispatch();
  const { show } = useToast();
  const user = useAppSelector((state) => state.session.user);
  const { data: groupsData } = useGroupsQuery();
  const { data: notificationsData } = useNotificationsQuery();
  const { data: overallData } = useOverallBalanceQuery();

  const totalGroups = groupsData?.data.length ?? 0;
  const unreadNotifications = notificationsData?.data.filter((notification) => !notification.isRead).length ?? 0;
  const totals = overallData?.data ?? { youOwe: 0, youAreOwed: 0, netBalance: 0 };

  const profileChips = useMemo(
    () => [
      user?.preferredCurrency ?? 'PKR',
      user?.preferredLanguage?.toUpperCase() ?? 'ENGLISH',
      unreadNotifications > 0 ? `${unreadNotifications} unread alerts` : 'No unread alerts',
    ],
    [unreadNotifications, user?.preferredCurrency, user?.preferredLanguage],
  );

  const handleAvatarPick = async () => {
    if (!user) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      show('Gallery permission is required to update your profile photo', { tone: 'error' });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]?.uri) {
      return;
    }

    const avatarUri = result.assets[0].uri;
    await preferencesStorage.setAvatarUri(avatarUri);
    dispatch(setCurrentUser({ ...user, avatarUrl: avatarUri }));
    show('Profile photo updated on this device', { tone: 'success' });
  };

  const handleLogout = async () => {
    await tokenStorage.clear();
    await preferencesStorage.clearAvatarUri();
    dispatch(api.util.resetApiState());
    dispatch(clearSession());
  };

  if (!user) {
    return (
      <Screen>
        <EmptyState title="Profile unavailable" subtitle="Log in again to load your profile from the server." />
      </Screen>
    );
  }

  const avatarInitial = user.fullName.trim().charAt(0).toUpperCase();

  return (
    <Screen>
      <AppCard style={{ gap: theme.spacing.lg, backgroundColor: theme.mode === 'dark' ? '#0C2033' : '#EAF2FF' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
          <Pressable
            onPress={() => void handleAvatarPick()}
            style={{
              width: 72,
              height: 72,
              borderRadius: theme.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.mode === 'dark' ? '#12395B' : '#D7E9FF',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {user.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={[theme.typography.display, { color: theme.colors.primary }]}>{avatarInitial}</Text>
            )}
            <View
              style={{
                position: 'absolute',
                right: 2,
                bottom: 2,
                width: 26,
                height: 26,
                borderRadius: theme.radius.pill,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: theme.mode === 'dark' ? '#0C2033' : '#EAF2FF',
              }}
            >
              <Ionicons name="camera-outline" size={14} color="#FFFFFF" />
            </View>
          </Pressable>

          <View style={{ flex: 1, gap: 6 }}>
            <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Profile hub</Text>
            <Text style={[theme.typography.h1, { color: theme.colors.text }]}>{user.fullName}</Text>
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{user.email}</Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Tap the profile photo to upload a new avatar</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {profileChips.map((chip) => (
            <View
              key={chip}
              style={{
                borderRadius: theme.radius.pill,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.xs,
                backgroundColor: theme.mode === 'dark' ? '#13314D' : '#FFFFFF',
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Text style={[theme.typography.caption, { color: theme.colors.text }]}>{chip}</Text>
            </View>
          ))}
        </View>

        <AppButton label="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
      </AppCard>

      <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
        <AppCard style={{ flex: 1, gap: 6 }}>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Groups</Text>
          <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{totalGroups}</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Active circles in your account</Text>
        </AppCard>
        <AppCard style={{ flex: 1, gap: 6 }}>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Net position</Text>
          <Text style={[theme.typography.h2, { color: totals.netBalance >= 0 ? theme.colors.success : theme.colors.danger }]}>
            {formatCurrency(Math.abs(totals.netBalance))}
          </Text>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Across all live groups</Text>
        </AppCard>
      </View>

      <AppCard style={{ gap: theme.spacing.md }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Account and security</Text>

        <View style={{ gap: theme.spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}>
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Email</Text>
            <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{maskEmail(user.email)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}>
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Phone</Text>
            <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{maskPhone(user.phone)}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}>
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Preferred language</Text>
            <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{user.preferredLanguage ?? 'English'}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}>
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Preferred currency</Text>
            <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{user.preferredCurrency ?? 'PKR'}</Text>
          </View>
        </View>
      </AppCard>

      <AppCard style={{ gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Settlement methods</Text>
          <Pressable onPress={() => navigation.navigate('PaymentMethodsSettings')}>
            <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Manage</Text>
          </Pressable>
        </View>

        {profilePaymentMethods.map((method) => (
          <View
            key={method.label}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: theme.spacing.md,
              borderRadius: theme.radius.md,
              padding: theme.spacing.md,
              backgroundColor: theme.mode === 'dark' ? '#10263A' : '#F8FBFF',
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: theme.radius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.mode === 'dark' ? '#163857' : '#E2EEFF',
                }}
              >
                <Ionicons name={method.icon} size={18} color={theme.colors.primary} />
              </View>
              <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{method.label}</Text>
            </View>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{method.value}</Text>
          </View>
        ))}
      </AppCard>

      <AppCard style={{ gap: theme.spacing.sm }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Quick actions</Text>

        {[
          { label: 'Open settings', icon: 'settings-outline' as const, route: 'Settings' },
          { label: 'Notifications', icon: 'notifications-outline' as const, route: 'Notifications' },
          { label: 'Settlement history', icon: 'time-outline' as const, route: 'SettlementHistory' },
          { label: 'Balance breakdown', icon: 'pie-chart-outline' as const, route: 'OverallBalance' },
        ].map((item) => (
          <Pressable
            key={item.label}
            onPress={() => navigation.navigate(item.route)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: theme.spacing.md,
              borderRadius: theme.radius.md,
              paddingVertical: theme.spacing.md,
              opacity: pressed ? 0.94 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
              <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
              <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={theme.colors.textMuted} />
          </Pressable>
        ))}
      </AppCard>

      <AppButton label="Sign out" variant="secondary" onPress={() => void handleLogout()} />
    </Screen>
  );
};
