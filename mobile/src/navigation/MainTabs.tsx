import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { HomeStack } from './HomeStack';
import { GroupsStack } from './GroupsStack';
import { MonthlyReportsScreen } from '../screens/reports/MonthlyReportsScreen';
import { useAppTheme } from '../theme/theme';

const Tab = createBottomTabNavigator();

const getTabIconName = (routeName: string, focused: boolean) => {
  switch (routeName) {
    case 'Home':
      return focused ? 'home' : 'home-outline';
    case 'Groups':
      return focused ? 'people' : 'people-outline';
    case 'Reports':
      return focused ? 'bar-chart' : 'bar-chart-outline';
    default:
      return focused ? 'ellipse' : 'ellipse-outline';
  }
};

export const MainTabs = () => {
  const theme = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.tab,
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={getTabIconName(route.name, focused)} size={size ?? 22} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Groups" component={GroupsStack} />
      <Tab.Screen name="Reports" component={MonthlyReportsScreen} />
    </Tab.Navigator>
  );
};
