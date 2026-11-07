import React from 'react';

import { FeatureScreen } from '../../components/common/FeatureScreen';

export const GroupBalanceScreen = () => (
  <FeatureScreen
    eyebrow="Balances"
    title="Group balance"
    description="Break down debts member by member with strong visual contrast between payables and receivables."
    bullets={['Pairwise ledger', 'Member-level summaries', 'Fast settle shortcuts']}
  />
);
