import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../../theme/theme';

export const OfflineBanner = () => {
  const theme = useAppTheme();

  return (
    <View style={[styles.banner, { backgroundColor: theme.colors.warning }]}> 
      <Text style={[theme.typography.caption, { color: '#071019' }]}>Offline mode active. Changes will sync when connection returns.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
});
