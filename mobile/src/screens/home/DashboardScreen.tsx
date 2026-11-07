import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import { AppCard } from '../../components/common/AppCard';
import { OfflineBanner } from '../../components/common/OfflineBanner';
import { Screen } from '../../components/common/Screen';
import { StatCard } from '../../components/common/StatCard';
import { TopAppHeader } from '../../components/common/TopAppHeader';
import { useConnectivity } from '../../hooks/useConnectivity';
import { useAppTheme } from '../../theme/theme';
import { useOverallBalanceQuery } from '../../store/api/baseApi';
import { formatCurrency } from '../../utils/currency';

export const DashboardScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { isOffline } = useConnectivity();
  const { data: balanceData, isLoading: balanceLoading } = useOverallBalanceQuery();
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  const totals = balanceData?.data ?? { youOwe: 0, youAreOwed: 0, netBalance: 0, topDuePerson: null };
  const walletBalance = balanceLoading ? 'Loading...' : formatCurrency(totals.netBalance);
  const displayedBalance = isBalanceVisible ? walletBalance : 'Rs. ******';
  const topDuePerson = totals.topDuePerson ?? null;
  const topDueInitial = topDuePerson?.fullName?.trim().charAt(0).toUpperCase() ?? '?';

  return (
    <Screen padded={false} showHeader={false}>
      <LinearGradient
        colors={theme.mode === 'dark' ? ['#103A32', '#113A63', '#04121F'] : ['#86E8C0', '#F4F2A8', '#C9F8E7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingBottom: theme.spacing.xl,
          gap: theme.spacing.lg,
        }}
      >
        <TopAppHeader variant="hero" />

        <View style={{ paddingHorizontal: theme.spacing.lg }}>
          <LinearGradient
            colors={theme.mode === 'dark' ? ['#102A43', '#0B1F33'] : ['#153B63', '#0C2440']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: theme.radius.xl,
              padding: theme.spacing.lg,
              gap: theme.spacing.lg,
              ...theme.shadows.floating,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md, flexWrap: 'wrap' }}>
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderRadius: theme.radius.md,
                  paddingHorizontal: theme.spacing.md,
                  paddingVertical: theme.spacing.sm,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.xs,
                }}
              >
                <Ionicons name="wallet-outline" size={18} color="#EEFFF8" />
                <Text style={[theme.typography.bodyStrong, { color: '#EEFFF8' }]}>PAK SPLIT Wallet</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs }}>
                <Text style={[theme.typography.bodyStrong, { color: '#F4FFFB' }]}>My Rewards</Text>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: theme.radius.pill,
                    backgroundColor: '#F7BE15',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="star" size={14} color="#7A5203" />
                </View>
              </View>
            </View>

            <View style={{ gap: theme.spacing.xs }}>
              <Text style={[theme.typography.body, { color: 'rgba(242,255,249,0.82)' }]}>Net Position</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
                <Text style={[theme.typography.display, { color: '#FFFFFF', flexShrink: 1 }]}>{displayedBalance}</Text>
                <Pressable onPress={() => setIsBalanceVisible((current) => !current)}>
                  <Ionicons name={isBalanceVisible ? 'eye-off-outline' : 'eye-outline'} size={28} color="#E6FFF3" />
                </Pressable>
              </View>
              <Text style={[theme.typography.body, { color: 'rgba(235,255,247,0.76)' }]}>Tap to hide balance</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Pressable
                onPress={() => navigation.navigate('CreateSettlement')}
                style={{
                  backgroundColor: '#7FD1FF',
                  borderRadius: theme.radius.pill,
                  paddingHorizontal: theme.spacing.xl,
                  paddingVertical: theme.spacing.md,
                  minWidth: 148,
                  alignItems: 'center',
                }}
              >
                <Text style={[theme.typography.bodyStrong, { color: '#0B2847' }]}>Settle Now</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg }}>
        {isOffline ? <OfflineBanner /> : null}
        <View style={{ gap: theme.spacing.xs }}>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>See what you owe, what friends owe you, and the next best action to close balances.</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
          <StatCard
            label="You owe"
            value={balanceLoading ? 'Loading...' : formatCurrency(totals.youOwe)}
            tone="danger"
            onPress={() => navigation.navigate('OverallBalance', { focus: 'owe' })}
          />
          <StatCard
            label="You are owed"
            value={balanceLoading ? 'Loading...' : formatCurrency(totals.youAreOwed)}
            tone="success"
            onPress={() => navigation.navigate('OverallBalance', { focus: 'owed' })}
          />
        </View>

        <StatCard
          label="Net balance"
          value={balanceLoading ? 'Loading...' : formatCurrency(totals.netBalance)}
          tone="neutral"
          onPress={() => navigation.navigate('OverallBalance', { focus: 'net' })}
        />

        <AppCard style={{ gap: theme.spacing.md, backgroundColor: theme.mode === 'dark' ? '#0F2336' : '#F6FAFF' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}>
            <View style={{ gap: 4, flex: 1 }}>
              <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Top due person</Text>
              <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
                {topDuePerson
                  ? topDuePerson.direction === 'owe'
                    ? 'Your biggest pending payment right now'
                    : 'The person who owes you the most right now'
                  : 'Your biggest person-to-person balance will appear here'}
              </Text>
            </View>
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: theme.radius.pill,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.mode === 'dark' ? '#173047' : '#EAF2FF',
              }}
            >
              <Ionicons
                name={topDuePerson?.direction === 'owe' ? 'arrow-up-outline' : 'arrow-down-outline'}
                size={18}
                color={topDuePerson?.direction === 'owe' ? theme.colors.danger : theme.colors.success}
              />
            </View>
          </View>

          {topDuePerson ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: theme.radius.pill,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : '#EAF2FF',
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
              >
                {topDuePerson.avatarUrl ? (
                  <Image source={{ uri: topDuePerson.avatarUrl }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{topDueInitial}</Text>
                )}
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{topDuePerson.fullName}</Text>
                <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
                  {topDuePerson.direction === 'owe' ? 'You owe this person the most' : 'This person owes you the most'}
                </Text>
              </View>
              <Text
                style={[
                  theme.typography.h3,
                  { color: topDuePerson.direction === 'owe' ? theme.colors.danger : theme.colors.success },
                ]}
              >
                {formatCurrency(topDuePerson.amount)}
              </Text>
            </View>
          ) : (
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
              Add shared expenses in active groups and the biggest outstanding person will show here automatically.
            </Text>
          )}
        </AppCard>
      </View>
    </Screen>
  );
};
