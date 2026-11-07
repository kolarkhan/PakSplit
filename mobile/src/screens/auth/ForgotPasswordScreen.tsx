import React from 'react';

import { FeatureScreen } from '../../components/common/FeatureScreen';

export const ForgotPasswordScreen = () => (
  <FeatureScreen
    eyebrow="Account recovery"
    title="Reset your password"
    description="The backend reset flow is wired and ready for email or OTP delivery next."
    bullets={['Email-based reset support', 'OTP-ready architecture for Pakistani phone login', 'Secure token lifecycle on the API']}
    ctaLabel="Send reset link"
  />
);
