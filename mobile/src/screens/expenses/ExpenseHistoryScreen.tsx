import React from 'react';

import { FeatureScreen } from '../../components/common/FeatureScreen';

export const ExpenseHistoryScreen = () => (
  <FeatureScreen
    eyebrow="History"
    title="Expense history"
    description="Browse past expenses with filters for member, category, and date range."
    bullets={['Search and filters', 'Swipe-friendly list actions', 'Weak-network friendly cached timeline']}
  />
);
