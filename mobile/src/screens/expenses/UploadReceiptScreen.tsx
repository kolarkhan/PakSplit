import React from 'react';

import { FeatureScreen } from '../../components/common/FeatureScreen';

export const UploadReceiptScreen = () => (
  <FeatureScreen
    eyebrow="Receipts"
    title="Upload receipt"
    description="Attach photos or screenshots with validation and progress placeholders ready for cloud storage."
    bullets={['JPEG, PNG, and WEBP validation', 'Upload progress placeholder', 'OCR extension hook']}
    ctaLabel="Upload receipt"
  />
);
