import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import { apiBaseUrl } from '../../constants/config';
import { tokenStorage } from '../../services/tokenStorage';
import { useGroupsQuery, useOverallBalanceQuery } from '../../store/api/baseApi';
import { useAppTheme } from '../../theme/theme';
import { formatCurrency } from '../../utils/currency';

type BalanceFocus = 'owe' | 'owed' | 'net';

interface GroupBalanceSummary {
  groupId: string;
  groupName: string;
  youOwe: number;
  youAreOwed: number;
  netBalance: number;
}

interface GroupBalanceApiEnvelope {
  success: boolean;
  message: string;
  data: {
    summary?: {
      youOwe: number;
      youAreOwed: number;
      netBalance: number;
    };
  };
}

const focusCopy: Record<BalanceFocus, { eyebrow: string; title: string; description: string }> = {
  owe: {
    eyebrow: 'Payables',
    title: 'Amounts you need to settle',
    description: 'See which groups are pulling your balance down and jump straight into settlement when needed.',
  },
  owed: {
    eyebrow: 'Receivables',
    title: 'Amounts others owe you',
    description: 'Track incoming balances across all your active groups and follow up where needed.',
  },
  net: {
    eyebrow: 'Summary',
    title: 'Your overall balance position',
    description: 'Compare what you owe, what you are owed, and which groups are driving your net position.',
  },
};

export const OverallBalanceScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<Record<string, { focus?: BalanceFocus } | undefined>, string>>();
  const { show } = useToast();
  const initialFocus = route.params?.focus ?? 'net';
  const [activeFocus, setActiveFocus] = useState<BalanceFocus>(initialFocus);
  const [groupSummaries, setGroupSummaries] = useState<GroupBalanceSummary[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  const { data: overallData, isLoading: overallLoading, isFetching: overallFetching } = useOverallBalanceQuery();
  const { data: groupsData, isLoading: groupsLoading, isFetching: groupsFetching } = useGroupsQuery();

  useEffect(() => {
    setActiveFocus(route.params?.focus ?? 'net');
  }, [route.params?.focus]);

  useEffect(() => {
    const groups = groupsData?.data ?? [];

    if (groups.length === 0) {
      setGroupSummaries([]);
      setIsLoadingGroups(false);
      return;
    }

    let isMounted = true;

    const loadGroupSummaries = async () => {
      setIsLoadingGroups(true);

      try {
        const accessToken = await tokenStorage.getAccessToken();
        const results = await Promise.all(
          groups.map(async (group) => {
            const response = await fetch(`${apiBaseUrl}/balances/group/${group._id}`, {
              headers: accessToken ? { authorization: `Bearer ${accessToken}` } : undefined,
            });

            if (!response.ok) {
              throw new Error(`Could not load balance for ${group.name}`);
            }

            const payload = (await response.json()) as GroupBalanceApiEnvelope;
            const summary = payload.data?.summary ?? { youOwe: 0, youAreOwed: 0, netBalance: 0 };

            return {
              groupId: group._id,
              groupName: group.name,
              youOwe: summary.youOwe ?? 0,
              youAreOwed: summary.youAreOwed ?? 0,
              netBalance: summary.netBalance ?? 0,
            } satisfies GroupBalanceSummary;
          }),
        );

        if (isMounted) {
          setGroupSummaries(results);
        }
      } catch (error) {
        if (isMounted) {
          setGroupSummaries([]);
          show(error instanceof Error ? error.message : 'Unable to load group balances', { tone: 'error' });
        }
      } finally {
        if (isMounted) {
          setIsLoadingGroups(false);
        }
      }
    };

    void loadGroupSummaries();

    return () => {
      isMounted = false;
    };
  }, [groupsData?.data, show]);

  const totals = overallData?.data ?? { youOwe: 0, youAreOwed: 0, netBalance: 0 };
  const isLoading = overallLoading || overallFetching || groupsLoading || groupsFetching || isLoadingGroups;
  const currentCopy = focusCopy[activeFocus];

  const filteredGroups = useMemo(() => {
    if (activeFocus === 'owe') {
      return groupSummaries.filter((group) => group.youOwe > 0).sort((a, b) => b.youOwe - a.youOwe);
    }

    if (activeFocus === 'owed') {
      return groupSummaries.filter((group) => group.youAreOwed > 0).sort((a, b) => b.youAreOwed - a.youAreOwed);
    }

    return [...groupSummaries].sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance));
  }, [activeFocus, groupSummaries]);

  const renderGroupAmount = (group: GroupBalanceSummary) => {
    if (activeFocus === 'owe') {
      return { label: 'You owe in this group', value: formatCurrency(group.youOwe), color: theme.colors.danger };
    }

    if (activeFocus === 'owed') {
      return { label: 'You are owed in this group', value: formatCurrency(group.youAreOwed), color: theme.colors.success };
    }

    return {
      label: group.netBalance >= 0 ? 'Net positive in this group' : 'Net payable in this group',
      value: formatCurrency(Math.abs(group.netBalance)),
      color: group.netBalance >= 0 ? theme.colors.success : theme.colors.danger,
    };
  };

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg }}>
        <View style={{ gap: 8 }}>
          <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>{currentCopy.eyebrow}</Text>
          <Text style={[theme.typography.h1, { color: theme.colors.text }]}>{currentCopy.title}</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{currentCopy.description}</Text>
        </View>

        <AppCard style={{ gap: theme.spacing.md, backgroundColor: theme.mode === 'dark' ? '#0C2033' : '#EAF2FF' }}>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            {(['owe', 'owed', 'net'] as BalanceFocus[]).map((focus) => {
              const selected = focus === activeFocus;
              return (
                <Pressable
                  key={focus}
                  onPress={() => setActiveFocus(focus)}
                  style={{
                    flex: 1,
                    borderRadius: theme.radius.md,
                    paddingVertical: theme.spacing.sm,
                    paddingHorizontal: theme.spacing.sm,
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    borderWidth: 1,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                    alignItems: 'center',
                  }}
                >
                  <Text style={[theme.typography.bodyStrong, { color: selected ? '#FFFFFF' : theme.colors.text }]}>
                    {focus === 'owe' ? 'You owe' : focus === 'owed' ? 'You are owed' : 'Net balance'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>You owe</Text>
              <Text style={[theme.typography.h3, { color: theme.colors.danger }]}>{formatCurrency(totals.youOwe)}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>You are owed</Text>
              <Text style={[theme.typography.h3, { color: theme.colors.success }]}>{formatCurrency(totals.youAreOwed)}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Net position</Text>
              <Text style={[theme.typography.h3, { color: totals.netBalance >= 0 ? theme.colors.success : theme.colors.danger }]}>
                {formatCurrency(Math.abs(totals.netBalance))}
              </Text>
            </View>
          </View>
        </AppCard>

        {isLoading ? (
          <AppCard style={{ gap: theme.spacing.sm, alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Loading balance breakdown...</Text>
          </AppCard>
        ) : filteredGroups.length === 0 ? (
          <EmptyState
            title={activeFocus === 'owe' ? 'Nothing to settle right now' : activeFocus === 'owed' ? 'No incoming balances right now' : 'No group balances yet'}
            subtitle={
              activeFocus === 'net'
                ? 'Add expenses in a group with active members and your net balance will start showing here.'
                : 'Create expenses in shared groups and this section will automatically update.'
            }
          />
        ) : (
          <View style={{ gap: theme.spacing.md }}>
            {filteredGroups.map((group) => {
              const amount = renderGroupAmount(group);

              return (
                <Pressable key={group.groupId} onPress={() => navigation.navigate('Groups', { screen: 'GroupDetails', params: { groupId: group.groupId } })}>
                  {({ pressed }) => (
                    <AppCard style={{ gap: theme.spacing.md, opacity: pressed ? 0.96 : 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: theme.spacing.md }}>
                        <View style={{ flex: 1, gap: 6 }}>
                          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{group.groupName}</Text>
                          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>{amount.label}</Text>
                          <Text style={[theme.typography.h2, { color: amount.color }]}>{amount.value}</Text>
                        </View>
                        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Open group</Text>
                      </View>

                      <View style={{ flexDirection: 'row', gap: theme.spacing.md }}>
                        <View style={{ flex: 1, gap: 4 }}>
                          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>You owe</Text>
                          <Text style={[theme.typography.bodyStrong, { color: theme.colors.danger }]}>{formatCurrency(group.youOwe)}</Text>
                        </View>
                        <View style={{ flex: 1, gap: 4 }}>
                          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>You are owed</Text>
                          <Text style={[theme.typography.bodyStrong, { color: theme.colors.success }]}>{formatCurrency(group.youAreOwed)}</Text>
                        </View>
                        <View style={{ flex: 1, gap: 4 }}>
                          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Net</Text>
                          <Text style={[theme.typography.bodyStrong, { color: group.netBalance >= 0 ? theme.colors.success : theme.colors.danger }]}>
                            {formatCurrency(Math.abs(group.netBalance))}
                          </Text>
                        </View>
                      </View>
                    </AppCard>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        <AppButton label="Go to settlement flow" onPress={() => navigation.navigate('CreateSettlement')} />
      </View>
    </Screen>
  );
};

