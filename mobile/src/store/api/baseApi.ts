import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { apiBaseUrl } from '../../constants/config';
import { tokenStorage } from '../../services/tokenStorage';
import type { ApiEnvelope, AppNotification, Expense, Group, GroupActivity, GroupBalanceSummaryResponse, OverallBalanceSummary, PaymentMethod, Settlement, User } from '../../types/models';

interface InviteLinkPayload {
  inviteCode: string;
  inviteUrl: string;
  qrPlaceholder: string;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: async (headers) => {
      const token = await tokenStorage.getAccessToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Group', 'Expense', 'Settlement', 'Notification'],
  endpoints: (builder) => ({
    login: builder.mutation<ApiEnvelope<{ user: User; tokens: { accessToken: string; refreshToken: string } }>, { email: string; password: string }>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation<ApiEnvelope<{ user: User; tokens: { accessToken: string; refreshToken: string } }>, { fullName: string; email: string; phone?: string; password: string }>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    me: builder.query<ApiEnvelope<User>, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    updateMe: builder.mutation<ApiEnvelope<User>, { fullName?: string; phone?: string; preferredCurrency?: string; preferredLanguage?: 'en' | 'ur' }>({
      query: (body) => ({ url: '/users/me', method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),
    addPaymentMethod: builder.mutation<ApiEnvelope<User>, PaymentMethod>({
      query: (body) => ({ url: '/users/me/payment-methods', method: 'POST', body }),
      invalidatesTags: ['User'],
    }),
    deletePaymentMethod: builder.mutation<ApiEnvelope<User>, string>({
      query: (id) => ({ url: `/users/me/payment-methods/${id}`, method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    groups: builder.query<ApiEnvelope<Group[]>, void>({
      query: () => '/groups',
      providesTags: ['Group'],
    }),
    groupById: builder.query<ApiEnvelope<Group>, string>({
      query: (groupId) => `/groups/${groupId}`,
      providesTags: ['Group'],
    }),
    createGroup: builder.mutation<ApiEnvelope<Group>, { name: string; description?: string }>({
      query: (body) => ({ url: '/groups', method: 'POST', body }),
      invalidatesTags: ['Group'],
    }),
    updateGroup: builder.mutation<ApiEnvelope<Group>, { groupId: string; name?: string; description?: string; avatarUrl?: string }>({
      query: ({ groupId, ...body }) => ({ url: `/groups/${groupId}`, method: 'PUT', body }),
      invalidatesTags: ['Group'],
    }),
    deleteGroup: builder.mutation<ApiEnvelope<{ deleted: boolean }>, string>({
      query: (groupId) => ({ url: `/groups/${groupId}`, method: 'DELETE' }),
      invalidatesTags: ['Group', 'Expense', 'Settlement', 'Notification'],
    }),
    inviteLink: builder.mutation<ApiEnvelope<InviteLinkPayload>, string>({
      query: (groupId) => ({ url: `/groups/${groupId}/invite-link`, method: 'POST' }),
    }),
    joinByInvite: builder.mutation<ApiEnvelope<Group>, string>({
      query: (inviteCode) => ({ url: `/groups/join/${inviteCode}`, method: 'POST' }),
      invalidatesTags: ['Group'],
    }),
    approveJoinRequest: builder.mutation<ApiEnvelope<Group>, { groupId: string; userId: string }>({
      query: ({ groupId, userId }) => ({ url: `/groups/${groupId}/join-requests/${userId}/approve`, method: 'PUT' }),
      invalidatesTags: ['Group', 'Notification'],
    }),
    declineJoinRequest: builder.mutation<ApiEnvelope<Group>, { groupId: string; userId: string }>({
      query: ({ groupId, userId }) => ({ url: `/groups/${groupId}/join-requests/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Group', 'Notification'],
    }),
    updateGroupMemberRole: builder.mutation<ApiEnvelope<Group>, { groupId: string; userId: string; role: 'admin' | 'member' }>({
      query: ({ groupId, userId, role }) => ({
        url: `/groups/${groupId}/members/${userId}/role`,
        method: 'PUT',
        body: { role },
      }),
      invalidatesTags: ['Group', 'Notification'],
    }),
    updateGroupMemberAvailability: builder.mutation<
      ApiEnvelope<Group>,
      {
        groupId: string;
        userId: string;
        availabilityStatus: 'active' | 'unavailable';
        unavailableUntil?: string;
        availabilityNote?: string;
        excludeFromNewExpenses?: boolean;
      }
    >({
      query: ({ groupId, userId, ...body }) => ({
        url: `/groups/${groupId}/members/${userId}/availability`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Group', 'Notification'],
    }),
    removeGroupMember: builder.mutation<ApiEnvelope<Group>, { groupId: string; userId: string }>({
      query: ({ groupId, userId }) => ({ url: `/groups/${groupId}/members/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Group', 'Notification', 'Expense', 'Settlement'],
    }),
    groupActivity: builder.query<ApiEnvelope<GroupActivity[]>, string>({
      query: (groupId) => `/groups/${groupId}/activity`,
      providesTags: ['Group'],
    }),
    notifications: builder.query<ApiEnvelope<AppNotification[]>, void>({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    overallBalance: builder.query<ApiEnvelope<OverallBalanceSummary>, void>({
      query: () => '/balances/overall',
      providesTags: ['Group', 'Expense', 'Settlement'],
    }),
    groupBalance: builder.query<ApiEnvelope<GroupBalanceSummaryResponse>, string>({
      query: (groupId) => `/balances/group/${groupId}`,
      providesTags: ['Group', 'Expense', 'Settlement'],
    }),
    markNotificationRead: builder.mutation<ApiEnvelope<AppNotification>, string>({
      query: (notificationId) => ({ url: `/notifications/${notificationId}/read`, method: 'PUT' }),
      invalidatesTags: ['Notification'],
    }),
    expensesByGroup: builder.query<ApiEnvelope<Expense[]>, string>({
      query: (groupId) => `/expenses/group/${groupId}`,
      providesTags: ['Expense'],
    }),
    recentExpenses: builder.query<ApiEnvelope<Expense[]>, void>({
      query: () => '/expenses/recent',
      providesTags: ['Expense'],
    }),
    createExpense: builder.mutation<
      ApiEnvelope<Expense>,
      {
        groupId: string;
        title: string;
        category: 'food' | 'travel' | 'fuel' | 'grocery' | 'rent' | 'utility_bills' | 'shopping' | 'event' | 'other';
        totalAmount: number;
        currency: 'PKR';
        paidBy: string;
        splitType: 'equal' | 'exact' | 'percentage' | 'shares';
        participants: string[];
        notes?: string;
        expenseDate: string;
      }
    >({
      query: (body) => ({ url: '/expenses', method: 'POST', body }),
      invalidatesTags: ['Expense', 'Group', 'Notification'],
    }),
    settlementsByGroup: builder.query<ApiEnvelope<Settlement[]>, string>({
      query: (groupId) => `/settlements/group/${groupId}`,
      providesTags: ['Settlement'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
  useUpdateMeMutation,
  useAddPaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useGroupsQuery,
  useGroupByIdQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useInviteLinkMutation,
  useJoinByInviteMutation,
  useApproveJoinRequestMutation,
  useDeclineJoinRequestMutation,
  useUpdateGroupMemberRoleMutation,
  useUpdateGroupMemberAvailabilityMutation,
  useRemoveGroupMemberMutation,
  useGroupActivityQuery,
  useNotificationsQuery,
  useMarkNotificationReadMutation,
  useOverallBalanceQuery,
  useGroupBalanceQuery,
  useExpensesByGroupQuery,
  useRecentExpensesQuery,
  useCreateExpenseMutation,
  useSettlementsByGroupQuery,
} = api;
