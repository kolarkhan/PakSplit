import React from 'react';

import { FeatureScreen } from '../../components/common/FeatureScreen';

export const EditExpenseScreen = () => (
  <FeatureScreen
    eyebrow="Expenses"
    title="Edit expense"
    description="Adjust split details safely while keeping balances recalculated and audit-ready."
    bullets={['Re-run split engine', 'Preserve receipt attachments', 'Timeline event for edits']}
    ctaLabel="Update expense"
  />
);
