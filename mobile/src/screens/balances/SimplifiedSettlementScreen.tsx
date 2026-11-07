import React from 'react';

import { FeatureScreen } from '../../components/common/FeatureScreen';

export const SimplifiedSettlementScreen = () => (
  <FeatureScreen
    eyebrow="Simplified"
    title="Settlement recommendations"
    description="Use greedy debt simplification to reduce the number of transfers the group needs."
    bullets={['Debtor to creditor recommendations', 'Reduced transfer count', 'Backend-driven correctness']}
  />
);
