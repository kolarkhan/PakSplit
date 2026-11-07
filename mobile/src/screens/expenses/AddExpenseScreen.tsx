import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import { useCreateExpenseMutation, useGroupByIdQuery, useGroupsQuery } from '../../store/api/baseApi';
import { useAppSelector } from '../../store/hooks';
import { useAppTheme } from '../../theme/theme';
import { getApiErrorMessage } from '../../utils/apiError';

const expenseCategories = [
  { label: 'Food', value: 'food' },
  { label: 'Travel', value: 'travel' },
  { label: 'Fuel', value: 'fuel' },
  { label: 'Grocery', value: 'grocery' },
  { label: 'Rent', value: 'rent' },
  { label: 'Utility Bills', value: 'utility_bills' },
  { label: 'Shopping', value: 'shopping' },
  { label: 'Event', value: 'event' },
  { label: 'Other', value: 'other' },
] as const;

const splitTypes = [
  { label: 'Equal', value: 'equal' },
  { label: 'Exact', value: 'exact' },
  { label: 'Percentage', value: 'percentage' },
  { label: 'Shares', value: 'shares' },
] as const;

export const AddExpenseScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RouteProp<Record<string, { groupId?: string } | undefined>, string>>();
  const { show } = useToast();
  const sessionUser = useAppSelector((state) => state.session.user);
  const fallbackGroups = useAppSelector((state) => state.groups.items);
  const { data: groupsData } = useGroupsQuery();
  const [createExpense, { isLoading }] = useCreateExpenseMutation();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState<(typeof expenseCategories)[number]['value']>('food');
  const [splitType, setSplitType] = useState<(typeof splitTypes)[number]['value']>('equal');
  const [error, setError] = useState<string | undefined>();

  const { data: groupDetailsData } = useGroupByIdQuery(route.params?.groupId ?? '', { skip: !route.params?.groupId });

  const group = useMemo(() => {
    const selectedGroupId = route.params?.groupId;
    const apiGroup = groupsData?.data.find((item) => item._id === selectedGroupId);
    if (apiGroup) {
      return { id: apiGroup._id, name: apiGroup.name };
    }

    const fallback = fallbackGroups.find((item) => item.id === selectedGroupId) ?? fallbackGroups[0];
    return fallback ? { id: fallback.id, name: fallback.name } : undefined;
  }, [fallbackGroups, groupsData?.data, route.params?.groupId]);

  const activeParticipantIds = useMemo(() => {
    const detailedMembers = groupDetailsData?.data?.members ?? [];
    const ids = detailedMembers
      .filter((member) => {
        if (member.status !== 'active') {
          return false;
        }

        const isUnavailable = member.availabilityStatus === 'unavailable' && (!member.unavailableUntil || new Date(member.unavailableUntil).getTime() > Date.now());
        if (!isUnavailable) {
          return true;
        }

        return member.excludeFromNewExpenses === false;
      })
      .map((member) => (typeof member.userId === 'object' && member.userId !== null ? member.userId._id : member.userId))
      .filter((value): value is string => Boolean(value));

    if (ids.length > 0) {
      return Array.from(new Set(ids));
    }

    return sessionUser?._id ? [sessionUser._id] : [];
  }, [groupDetailsData?.data?.members, sessionUser?._id]);

  const handleSaveExpense = async () => {
    if (!title.trim()) {
      setError('Expense title is required');
      return;
    }

    if (!amount.trim() || Number.isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Enter a valid PKR amount');
      return;
    }

    if (!group) {
      show('Select a valid group first', { tone: 'error' });
      return;
    }

    if (!sessionUser?._id) {
      show('Log in again to continue', { tone: 'error' });
      return;
    }

    if (activeParticipantIds.length === 0) {
      show('No active group members found for this expense', { tone: 'error' });
      return;
    }

    try {
      await createExpense({
        groupId: group.id,
        title: title.trim(),
        category,
        totalAmount: Number(amount),
        currency: 'PKR',
        paidBy: sessionUser._id,
        splitType,
        participants: activeParticipantIds,
        notes: notes.trim() || undefined,
        expenseDate: new Date().toISOString(),
      }).unwrap();

      setError(undefined);
      show(title.trim() + ' saved in ' + group.name, { tone: 'success' });
      navigation.navigate('GroupDetails', { groupId: group.id });
    } catch (apiError) {
      show(getApiErrorMessage(apiError, 'Could not save expense'), { tone: 'error' });
    }
  };

  return (
    <Screen>
      <View style={{ gap: theme.spacing.xs }}>
        <Text style={[theme.typography.caption, { color: theme.colors.primary }]}>Expenses</Text>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Add an expense</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Capture payer, category, split style, and a receipt placeholder in a clean Pakistan-first flow.</Text>
      </View>

      <AppCard style={{ gap: theme.spacing.md, backgroundColor: theme.mode === 'dark' ? '#0C2033' : '#F1F7FF' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: theme.radius.md,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.mode === 'dark' ? '#173B61' : '#D7E9FF',
            }}
          >
            <Ionicons name="people-outline" size={22} color={theme.colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Adding expense to</Text>
            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>{group?.name ?? 'Your group'}</Text>
          </View>
        </View>
      </AppCard>

      <AppCard style={{ gap: theme.spacing.md }}>
        <AppInput
          label="Expense title"
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            if (error) {
              setError(undefined);
            }
          }}
          error={error}
          placeholder="Dinner at Monal"
        />
        <AppInput
          label="Amount in PKR"
          value={amount}
          onChangeText={(value) => {
            setAmount(value.replace(/[^0-9]/g, ''));
            if (error) {
              setError(undefined);
            }
          }}
          keyboardType="numeric"
          placeholder="4000"
        />
        <AppInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="4 friends, rooftop dinner, paid in cash"
          multiline
          numberOfLines={4}
          style={{ minHeight: 110, textAlignVertical: 'top', paddingTop: 16 }}
        />
      </AppCard>

      <View style={{ gap: theme.spacing.sm }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Category</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {expenseCategories.map((item) => {
            const selected = category === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => setCategory(item.value)}
                style={{
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: selected ? theme.colors.primary : theme.colors.border,
                  backgroundColor: selected ? (theme.mode === 'dark' ? '#10304F' : '#E7F1FF') : theme.colors.surface,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <Text style={[theme.typography.bodyStrong, { color: selected ? theme.colors.primary : theme.colors.text }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Split type</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          {splitTypes.map((item) => {
            const selected = splitType === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => setSplitType(item.value)}
                style={{
                  borderRadius: theme.radius.md,
                  borderWidth: 1,
                  borderColor: selected ? theme.colors.success : theme.colors.border,
                  backgroundColor: selected ? (theme.mode === 'dark' ? '#10372A' : '#E8F9F0') : theme.colors.surface,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <Text style={[theme.typography.bodyStrong, { color: selected ? theme.colors.success : theme.colors.text }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Paid by</Text>
        <View style={{ gap: theme.spacing.xs }}>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Split across {activeParticipantIds.length} active member{activeParticipantIds.length === 1 ? '' : 's'}. Unavailable members are skipped from new splits.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
          <Pressable
            style={{
              borderRadius: theme.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.warning,
              backgroundColor: theme.mode === 'dark' ? '#3A2A12' : '#FFF4E0',
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
          >
            <Text style={[theme.typography.bodyStrong, { color: theme.colors.warning }]}>{sessionUser?.fullName ?? 'You'}</Text>
          </Pressable>
        </View>
      </View>
    </View>

      <AppCard style={{ gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Receipt upload</Text>
            <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Keep a screenshot, bill photo, or transaction proof ready. Upload progress can plug in here later.</Text>
          </View>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: theme.radius.md,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.mode === 'dark' ? '#0F263B' : '#ECF3FA',
            }}
          >
            <Ionicons name="receipt-outline" size={24} color={theme.colors.textMuted} />
          </View>
        </View>
        <AppButton label="Attach receipt" variant="secondary" onPress={() => Alert.alert('Receipt upload', 'Receipt picker placeholder is ready for integration.')} />
      </AppCard>

      <View style={{ gap: theme.spacing.sm }}>
        <AppButton label="Save expense" onPress={handleSaveExpense} loading={isLoading} />
        <AppButton label="Cancel" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
};


