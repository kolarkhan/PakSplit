import React from 'react';

import { FeatureScreen } from '../../components/common/FeatureScreen';

export const CategoryInsightsScreen = () => (
  <FeatureScreen eyebrow="Reports" title="Category insights" description="Explore spending by category, member activity, and export-ready summaries." bullets={['CSV export surface', 'PDF placeholder hook', 'Most active members']} />
);
