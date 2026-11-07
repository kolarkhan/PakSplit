import React from 'react';

import { FeatureScreen } from '../../components/common/FeatureScreen';

export const SettlementMethodScreen = () => (
  <FeatureScreen
    eyebrow="Methods"
    title="Choose settlement method"
    description="Capture transaction ID, account title, phone number, and bank fields as first-class manual settlement details."
    bullets={['EasyPaisa and JazzCash', 'Raast and bank transfer', 'Cash and manual confirmation']}
  />
);
