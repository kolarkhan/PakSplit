import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DashboardScreen } from '../screens/home/DashboardScreen';
import { NotificationsScreen } from '../screens/home/NotificationsScreen';
import { OverallBalanceScreen } from '../screens/balances/OverallBalanceScreen';
import { GroupBalanceScreen } from '../screens/balances/GroupBalanceScreen';
import { SimplifiedSettlementScreen } from '../screens/balances/SimplifiedSettlementScreen';
import { CreateSettlementScreen } from '../screens/settlements/CreateSettlementScreen';
import { SettlementMethodScreen } from '../screens/settlements/SettlementMethodScreen';
import { SettlementDetailScreen } from '../screens/settlements/SettlementDetailScreen';
import { SettlementHistoryScreen } from '../screens/settlements/SettlementHistoryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';

const Stack = createNativeStackNavigator();

export const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DashboardHome" component={DashboardScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="OverallBalance" component={OverallBalanceScreen} />
    <Stack.Screen name="GroupBalance" component={GroupBalanceScreen} />
    <Stack.Screen name="SimplifiedSettlement" component={SimplifiedSettlementScreen} />
    <Stack.Screen name="CreateSettlement" component={CreateSettlementScreen} />
    <Stack.Screen name="SettlementMethod" component={SettlementMethodScreen} />
    <Stack.Screen name="SettlementDetail" component={SettlementDetailScreen} />
    <Stack.Screen name="SettlementHistory" component={SettlementHistoryScreen} />
  </Stack.Navigator>
);
