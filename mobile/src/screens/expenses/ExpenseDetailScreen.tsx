import React from 'react';

import { FeatureScreen } from '../../components/common/FeatureScreen';

export const ExpenseDetailScreen = () => (
  <FeatureScreen
    eyebrow="Expense detail"
    title="Expense detail"
    description="Show payer, participants, notes, receipt, and the exact split summary for every member."
    bullets={['Per-member owed amount', 'Receipt preview', 'Edit and delete actions']}
  />
);
