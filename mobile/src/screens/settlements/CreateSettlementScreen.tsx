import React from 'react';
import { Text, View } from 'react-native';

import { AppButton } from '../../components/common/AppButton';
import { Screen } from '../../components/common/Screen';
import { SettlementMethodChip } from '../../components/settlement/SettlementMethodChip';
import { paymentMethods } from '../../constants/paymentMethods';
import { useAppTheme } from '../../theme/theme';

export const CreateSettlementScreen = () => {
  const theme = useAppTheme();
  return (
    <Screen>
      <View style={{ gap: 10 }}>
        <Text style={[theme.typography.h1, { color: theme.colors.text }]}>Settle a balance</Text>
        <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>Choose the payment method your group actually uses, then add proof and reference details.</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {paymentMethods.map((method) => (
          <SettlementMethodChip key={method} label={method} />
        ))}
      </View>
      <AppButton label="Continue" />
    </Screen>
  );
};
