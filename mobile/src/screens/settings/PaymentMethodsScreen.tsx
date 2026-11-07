import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppButton } from '../../components/common/AppButton';
import { AppCard } from '../../components/common/AppCard';
import { AppInput } from '../../components/common/AppInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Screen } from '../../components/common/Screen';
import { useToast } from '../../components/common/ToastProvider';
import { useAddPaymentMethodMutation, useDeletePaymentMethodMutation } from '../../store/api/baseApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setCurrentUser } from '../../store/slices/sessionSlice';
import { useAppTheme } from '../../theme/theme';
import type { PaymentMethod } from '../../types/models';
import { getApiErrorMessage } from '../../utils/apiError';

const methodTypes: Array<{ label: string; value: PaymentMethod['type'] }> = [
  { label: 'EasyPaisa', value: 'easypaisa' },
  { label: 'JazzCash', value: 'jazzcash' },
  { label: 'Raast', value: 'raast' },
  { label: 'Bank Transfer', value: 'bank' },
  { label: 'Cash', value: 'cash' },
];

const typeLabel: Record<PaymentMethod['type'], string> = {
  easypaisa: 'EasyPaisa',
  jazzcash: 'JazzCash',
  raast: 'Raast',
  bank: 'Bank Transfer',
  cash: 'Cash',
};

export const PaymentMethodsScreen = () => {
  const theme = useAppTheme();
  const { show } = useToast();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.session.user);
  const paymentMethods = user?.paymentMethods ?? [];
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<PaymentMethod['type']>('easypaisa');
  const [label, setLabel] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumberMasked, setAccountNumberMasked] = useState('');
  const [ibanMasked, setIbanMasked] = useState('');
  const [addPaymentMethod, { isLoading: isAddingPaymentMethod }] = useAddPaymentMethodMutation();
  const [deletePaymentMethod, { isLoading: isDeletingPaymentMethod }] = useDeletePaymentMethodMutation();

  const resetForm = () => {
    setType('easypaisa');
    setLabel('');
    setAccountTitle('');
    setPhoneNumber('');
    setBankName('');
    setAccountNumberMasked('');
    setIbanMasked('');
  };

  const handleAdd = async () => {
    if (!label.trim()) {
      show('Method label is required', { tone: 'error' });
      return;
    }

    try {
      const payload = await addPaymentMethod({
        type,
        label: label.trim(),
        accountTitle: accountTitle.trim() || undefined,
        phoneNumber: phoneNumber.trim() || undefined,
        bankName: bankName.trim() || undefined,
        accountNumberMasked: accountNumberMasked.trim() || undefined,
        ibanMasked: ibanMasked.trim() || undefined,
        isDefault: paymentMethods.length === 0,
      }).unwrap();

      dispatch(setCurrentUser(payload.data));
      show('Payment method added', { tone: 'success' });
      resetForm();
      setIsAdding(false);
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not add payment method'), { tone: 'error' });
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) {
      show('This payment method cannot be removed yet', { tone: 'error' });
      return;
    }

    try {
      const payload = await deletePaymentMethod(id).unwrap();
      dispatch(setCurrentUser(payload.data));
      show('Payment method removed', { tone: 'success' });
    } catch (error) {
      show(getApiErrorMessage(error, 'Could not remove payment method'), { tone: 'error' });
    }
  };

  return (
    <Screen>
      <View style={{ gap: 10 }}>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Payment methods</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Manage EasyPaisa, JazzCash, Raast, and bank details with masked account information.</Text>
      </View>

      {paymentMethods.length === 0 ? (
        <EmptyState
          title="No saved payment methods"
          subtitle="Add your first payment method below so settlements can reuse your preferred details."
        />
      ) : (
        <View style={{ gap: theme.spacing.md }}>
          {paymentMethods.map((method) => (
            <AppCard key={method._id ?? method.label} style={{ gap: theme.spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: theme.spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm, flex: 1 }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: theme.radius.md,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.mode === 'dark' ? '#10263A' : '#EAF2FF',
                    }}
                  >
                    <Ionicons name={method.type === 'bank' ? 'card-outline' : 'wallet-outline'} size={20} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[theme.typography.bodyStrong, { color: theme.colors.text }]}>{method.label}</Text>
                    <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>{typeLabel[method.type]}</Text>
                  </View>
                </View>
                <Pressable onPress={() => void handleDelete(method._id)}>
                  <Ionicons name="trash-outline" size={20} color={theme.colors.danger} />
                </Pressable>
              </View>

              {method.phoneNumber ? <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Phone: {method.phoneNumber}</Text> : null}
              {method.accountTitle ? <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Account title: {method.accountTitle}</Text> : null}
              {method.bankName ? <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Bank: {method.bankName}</Text> : null}
              {method.accountNumberMasked ? <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Account: {method.accountNumberMasked}</Text> : null}
              {method.ibanMasked ? <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>IBAN: {method.ibanMasked}</Text> : null}
            </AppCard>
          ))}
        </View>
      )}

      <AppCard style={{ gap: theme.spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[theme.typography.h3, { color: theme.colors.text }]}>Add payment method</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isAdding ? 'Hide payment method form' : 'Show payment method form'}
            onPress={() => setIsAdding((current) => !current)}
            style={({ pressed }) => ({
              width: 38,
              height: 38,
              borderRadius: theme.radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.mode === 'dark' ? theme.colors.surfaceMuted : '#EAF2FF',
              borderWidth: 1,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Ionicons
              name={isAdding ? 'eye-off-outline' : 'eye-outline'}
              size={18}
              color={theme.colors.text}
            />
          </Pressable>
        </View>

        {isAdding ? (
          <View style={{ gap: theme.spacing.md }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
              {methodTypes.map((option) => {
                const selected = option.value === type;
                return (
                  <AppButton
                    key={option.value}
                    label={option.label}
                    variant={selected ? 'primary' : 'secondary'}
                    onPress={() => setType(option.value)}
                  />
                );
              })}
            </View>

            <AppInput label="Label" value={label} onChangeText={setLabel} placeholder="My EasyPaisa" />
            <AppInput label="Account title" value={accountTitle} onChangeText={setAccountTitle} placeholder="Kolar Khan" />
            <AppInput label="Phone number" value={phoneNumber} onChangeText={setPhoneNumber} placeholder="03xx xxxxxxx" />
            <AppInput label="Bank name" value={bankName} onChangeText={setBankName} placeholder="Meezan Bank" />
            <AppInput label="Masked account number" value={accountNumberMasked} onChangeText={setAccountNumberMasked} placeholder="****1234" />
            <AppInput label="Masked IBAN" value={ibanMasked} onChangeText={setIbanMasked} placeholder="PK36****9012" />

            <View style={{ gap: theme.spacing.sm }}>
              <AppButton label="Save payment method" onPress={() => void handleAdd()} loading={isAddingPaymentMethod} />
              <AppButton
                label="Cancel"
                variant="ghost"
                onPress={() => {
                  resetForm();
                  setIsAdding(false);
                }}
                disabled={isAddingPaymentMethod || isDeletingPaymentMethod}
              />
            </View>
          </View>
        ) : null}
      </AppCard>
    </Screen>
  );
};

