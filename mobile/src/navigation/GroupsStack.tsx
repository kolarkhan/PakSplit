import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddExpenseScreen } from '../screens/expenses/AddExpenseScreen';
import { EditExpenseScreen } from '../screens/expenses/EditExpenseScreen';
import { ExpenseDetailScreen } from '../screens/expenses/ExpenseDetailScreen';
import { ExpenseHistoryScreen } from '../screens/expenses/ExpenseHistoryScreen';
import { UploadReceiptScreen } from '../screens/expenses/UploadReceiptScreen';
import { CreateGroupScreen } from '../screens/groups/CreateGroupScreen';
import { GroupActivityScreen } from '../screens/groups/GroupActivityScreen';
import { GroupDetailsScreen } from '../screens/groups/GroupDetailsScreen';
import { GroupListScreen } from '../screens/groups/GroupListScreen';
import { GroupMembersScreen } from '../screens/groups/GroupMembersScreen';
import { GroupPendingRequestsScreen } from '../screens/groups/GroupPendingRequestsScreen';
import { GroupSettingsScreen } from '../screens/groups/GroupSettingsScreen';
import { InviteMemberScreen } from '../screens/groups/InviteMemberScreen';
import { JoinGroupScreen } from '../screens/groups/JoinGroupScreen';

const Stack = createNativeStackNavigator();

export const GroupsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GroupListHome" component={GroupListScreen} />
    <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
    <Stack.Screen name="JoinGroup" component={JoinGroupScreen} />
    <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
    <Stack.Screen name="GroupSettings" component={GroupSettingsScreen} />
    <Stack.Screen name="GroupPendingRequests" component={GroupPendingRequestsScreen} />
    <Stack.Screen name="GroupMembers" component={GroupMembersScreen} />
    <Stack.Screen name="GroupActivity" component={GroupActivityScreen} />
    <Stack.Screen name="InviteMember" component={InviteMemberScreen} />
    <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
    <Stack.Screen name="EditExpense" component={EditExpenseScreen} />
    <Stack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} />
    <Stack.Screen name="ExpenseHistory" component={ExpenseHistoryScreen} />
    <Stack.Screen name="UploadReceipt" component={UploadReceiptScreen} />
  </Stack.Navigator>
);
