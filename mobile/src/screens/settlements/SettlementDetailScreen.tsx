import React from 'react';

import { FeatureScreen } from '../../components/common/FeatureScreen';

export const SettlementDetailScreen = () => (
  <FeatureScreen
    eyebrow="Settlement detail"
    title="Settlement detail"
    description="Review payment method, reference details, proof, and confirmation state in one clear surface."
    bullets={['Attachment preview', 'Confirmation CTA', 'Dispute placeholder']}
  />
);
