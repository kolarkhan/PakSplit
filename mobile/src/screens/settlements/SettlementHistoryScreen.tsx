import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import { apiBaseUrl } from '../../constants/config';
import { tokenStorage } from '../../services/tokenStorage';
import { useGroupsQuery } from '../../store/api/baseApi';
import { useAppTheme } from '../../theme/theme';
import type { ApiEnvelope, Settlement } from '../../types/models';
import { formatCurrency } from '../../utils/currency';

type HistoryFilter = 'all' | 'pending' | 'completed' | 'cancelled';

type SettlementHistoryItem = Settlement & { groupName: string };

const formatTime = (value?: string) => {
  if (!value) {
    return 'Recently';
  }

  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const SettlementHistoryScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { show } = useToast();
  const { data: groupsData, isLoading: groupsLoading, isFetching: groupsFetching } = useGroupsQuery();
  const [items, setItems] = useState<SettlementHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [filter, setFilter] = useState<HistoryFilter>('all');

  useEffect(() => {
    const groups = groupsData?.data ?? [];

    if (groups.length === 0) {
      setItems([]);
      setIsLoadingHistory(false);
      return;
    }

    let isMounted = true;

    const loadHistory = async () => {
      setIsLoadingHistory(true);

      try {
        const accessToken = await tokenStorage.getAccessToken();
        const responses = await Promise.all(
          groups.map(async (group) => {
            const response = await fetch(`${apiBaseUrl}/settlements/group/${group._id}`, {
              headers: accessToken ? { authorization: `Bearer ${accessToken}` } : undefined,
            });

            if (!response.ok) {
              throw new Error(`Could not load settlements for ${group.name}`);
            }

            const payload = (await response.json()) as ApiEnvelope<Settlement[]>;
            return payload.data.map((settlement) => ({ ...settlement, groupName: group.name }));
          }),
        );

        if (isMounted) {
          setItems(
            responses
              .flat()
              .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()),
          );
        }
      } catch (error) {
        if (isMounted) {
          setItems([]);
          show(error instanceof Error ? error.message : 'Unable to load settlement history', { tone: 'error' });
        }
      } finally {
        if (isMounted) {
          setIsLoadingHistory(false);
        }
      }
    };

    void loadHistory();

    return () => {
      isMounted = false;
    };
  }, [groupsData?.data, show]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') {
      return items;
    }

    return items.filter((item) => item.status === filter);
  }, [filter, items]);

  const isLoading = groupsLoading || groupsFetching || isLoadingHistory;

  return (
    <Screen padded={false}>
      <View style={{ paddingHorizontal: theme.spacing.lg, gap: theme.spacing.lg }}>
        <View style={{ gap: 8 }}>
          <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>History</Text>
          <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Settlement history</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Review pending, completed, and cancelled settlements across your groups.</Text>
        </View>

        <AppCard style={{ gap: theme.spacing.md, backgroundColor: theme.mode === 'dark' ? '#0C2033' : '#EAF2FF' }}>
          <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
            {(['all', 'pending', 'completed', 'cancelled'] as HistoryFilter[]).map((item) => {
              const selected = item === filter;
              return (
                <Pressable
                  key={item}
                  onPress={() => setFilter(item)}
                  style={{
                    borderRadius: theme.radius.pill,
                    paddingHorizontal: theme.spacing.md,
                    paddingVertical: theme.spacing.sm,
                    backgroundColor: selected ? theme.colors.primary : theme.colors.surface,
                    borderWidth: 1,
                    borderColor: selected ? theme.colors.primary : theme.colors.border,
                  }}
                >
                  <Text style={[theme.typography.caption, { color: selected ? '#FFFFFF' : theme.colors.text }]}>{item.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>
        </AppCard>

        {isLoading ? (
          <AppCard style={{ gap: theme.spacing.sm, alignItems: 'center' }}>
            <ActivityIndicator color={theme.colors.primary} />
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Loading settlement history...</Text>
          </AppCard>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No settlements yet"
            subtitle="Once you record or receive settlements in your groups, they will appear here with status and method details."
          />
        ) : (
          <View style={{ gap: theme.spacing.md }}>
            {filteredItems.map((item) => {
              const statusColor = item.status === 'completed' ? theme.colors.success : item.status === 'pending' ? theme.colors.warning : theme.colors.danger;

              return (
                <Pressable
                  key={item._id}
                  onPress={() => navigation.navigate('Groups', { screen: 'GroupDetails', params: { groupId: item.groupId } })}
                >
                  {({ pressed }) => (
                    <AppCard style={{ gap: theme.spacing.md, opacity: pressed ? 0.96 : 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: theme.spacing.md }}>
                        <View style={{ flex: 1, gap: 6 }}>
                          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{item.groupName}</Text>
                          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
                            {item.method} settlement • {formatTime(item.createdAt)}
                          </Text>
                        </View>
                        <View
                          style={{
                            borderRadius: theme.radius.pill,
                            paddingHorizontal: theme.spacing.md,
                            paddingVertical: 6,
                            backgroundColor: theme.mode === 'dark' ? '#12263A' : '#F6FAFF',
                            borderWidth: 1,
                            borderColor: theme.colors.border,
                          }}
                        >
                          <Text style={[theme.typography.caption, { color: statusColor }]}>{item.status.toUpperCase()}</Text>
                        </View>
                      </View>

                      <Text style={[theme.typography.h2, { color: theme.colors.text }]}>{formatCurrency(item.amount)}</Text>

                      {item.note ? <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{item.note}</Text> : null}
                      {item.transactionReference ? (
                        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Ref: {item.transactionReference}</Text>
                      ) : null}
                    </AppCard>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        <AppButton label="Create settlement" onPress={() => navigation.navigate('CreateSettlement')} />
      </View>
    </Screen>
  );
};

