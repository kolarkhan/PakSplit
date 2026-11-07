import React from 'react';
import { View } from 'react-native';

export const SkeletonBlock = ({ height = 20 }: { height?: number }) => (
  <View
    style={{
      height,
      borderRadius: 14,
      backgroundColor: '#D8E3EF',
      opacity: 0.55,
    }}
  />
);
