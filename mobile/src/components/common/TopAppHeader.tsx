import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import { useToast } from './ToastProvider';
import { useNotificationsQuery } from '../../store/api/baseApi';
import { useAppSelector } from '../../store/hooks';
import { useAppTheme } from '../../theme/theme';

const headerActions = ['search-outline', 'notifications-outline', 'scan-outline'] as const;

type TopAppHeaderProps = {
  variant?: 'default' | 'hero';
};

export const TopAppHeader = ({ variant = 'default' }: TopAppHeaderProps) => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { show } = useToast();
  const user = useAppSelector((state) => state.session.user);
  const { data: notificationsData } = useNotificationsQuery();

  const displayName = user?.fullName?.trim() || 'PAK SPLIT User';
  const avatarInitial = displayName.charAt(0).toUpperCase();
  const unreadCount = notificationsData?.data.filter((notification) => !notification.isRead).length ?? 0;
  const isHero = variant === 'hero';

  const handleHeaderAction = (iconName: (typeof headerActions)[number]) => {
    if (iconName === 'search-outline') {
      navigation.navigate('Groups');
      return;
    }

    if (iconName === 'notifications-outline') {
      navigation.navigate('Notifications');
      return;
    }

    show('Receipt scan integration coming soon', { tone: 'info' });
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.sm,
      }}
    >
      <Pressable
        onPress={() => navigation.navigate('Profile')}
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing.sm,
            flex: 1,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: theme.radius.pill,
            backgroundColor: isHero
              ? 'rgba(255,255,255,0.72)'
              : theme.mode === 'dark'
                ? 'rgba(17,34,53,0.92)'
                : '#EAF2FF',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderWidth: 1,
            borderColor: isHero ? 'rgba(255,255,255,0.4)' : theme.colors.border,
            overflow: 'hidden',
          }}
        >
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <Text style={[theme.typography.h3, { color: isHero ? '#0A241F' : theme.colors.text }]}>{avatarInitial}</Text>
          )}
          <View
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: 22,
              height: 22,
              borderRadius: theme.radius.pill,
              backgroundColor: '#1D2330',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: isHero ? 'rgba(255,255,255,0.78)' : theme.mode === 'dark' ? '#04121F' : '#FFFFFF',
            }}
          >
            <Ionicons name="person" size={12} color="#FFFFFF" />
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              theme.typography.caption,
              { color: isHero ? 'rgba(12,35,30,0.7)' : theme.colors.textMuted },
            ]}
          >
            Welcome back
          </Text>
          <Text
            style={[theme.typography.h3, { color: isHero ? '#0A241F' : theme.colors.text }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>
        </View>
      </Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
        {headerActions.map((iconName) => (
          <Pressable
            key={iconName}
            onPress={() => handleHeaderAction(iconName)}
            style={{
              width: 42,
              height: 42,
              borderRadius: theme.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isHero
                ? 'rgba(255,255,255,0.46)'
                : theme.mode === 'dark'
                  ? theme.colors.surfaceMuted
                  : '#EDF4FB',
              borderWidth: 1,
              borderColor: isHero ? 'rgba(255,255,255,0.35)' : theme.colors.border,
              position: 'relative',
            }}
          >
            <Ionicons name={iconName} size={22} color={isHero ? '#13282A' : theme.colors.text} />
            {iconName === 'notifications-outline' && unreadCount > 0 ? (
              <View
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -2,
                  minWidth: 20,
                  height: 20,
                  borderRadius: theme.radius.pill,
                  paddingHorizontal: 5,
                  backgroundColor: theme.colors.danger,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: isHero ? 'rgba(255,255,255,0.9)' : theme.mode === 'dark' ? theme.colors.background : '#FFFFFF',
                }}
              >
                <Text style={[theme.typography.caption, { color: '#FFFFFF', fontSize: 10 }]}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
};
