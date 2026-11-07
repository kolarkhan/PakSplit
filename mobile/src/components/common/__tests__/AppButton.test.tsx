import React from 'react';
import { render } from '@testing-library/react-native';

import { AppButton } from '../AppButton';

describe('AppButton', () => {
  it('renders the button label', () => {
    const { getByText } = render(<AppButton label="Settle now" />);
    expect(getByText('Settle now')).toBeTruthy();
  });
});
