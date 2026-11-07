import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { demoDashboard } from '../../constants/demoData';

export interface DemoGroupItem {
  id: string;
  name: string;
  description: string;
  members: number;
  balance: number;
  inviteCode: string;
  source: 'demo' | 'created' | 'joined';
}

const buildInviteCode = (name: string) => {
  const sanitized = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const fallback = sanitized || 'GROUP';
  const suffix = String(Date.now()).slice(-4);
  return `${fallback}${suffix}`;
};

const baseGroups: DemoGroupItem[] = [
  {
    id: 'group-demo-1',
    name: demoDashboard.groups[0]?.name ?? 'Murree Trip Crew',
    description: 'Weekend trip expenses for rides, dinner, chai stops, and hotel sharing.',
    members: demoDashboard.groups[0]?.members ?? 5,
    balance: demoDashboard.groups[0]?.balance ?? 4200,
    inviteCode: 'MURREE24',
    source: 'demo',
  },
  {
    id: 'group-demo-2',
    name: demoDashboard.groups[1]?.name ?? 'Flat 304 Bills',
    description: 'Monthly flat expenses for rent, utilities, groceries, and maintenance.',
    members: demoDashboard.groups[1]?.members ?? 4,
    balance: demoDashboard.groups[1]?.balance ?? -1800,
    inviteCode: 'FLAT304',
    source: 'demo',
  },
];

export const joinableGroupCatalog: DemoGroupItem[] = [
  {
    id: 'group-join-1',
    name: 'Office Lunch Squad',
    description: 'Shared team lunches, chai rounds, and monthly office snack runs.',
    members: 8,
    balance: 0,
    inviteCode: 'LUNCH786',
    source: 'joined',
  },
  {
    id: 'group-join-2',
    name: 'Family Event Fund',
    description: 'Wedding planning, decor, transport, and catering split across family members.',
    members: 11,
    balance: 0,
    inviteCode: 'SHAADIPK',
    source: 'joined',
  },
  {
    id: 'group-join-3',
    name: 'Lahore Trip Mates',
    description: 'Road trip fuel, food, tickets, and stay split for the Lahore weekend.',
    members: 6,
    balance: 0,
    inviteCode: 'LHRTRIP',
    source: 'joined',
  },
];

interface GroupsState {
  items: DemoGroupItem[];
}

const initialState: GroupsState = {
  items: baseGroups,
};

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    createGroup: {
      reducer: (state, action: PayloadAction<DemoGroupItem>) => {
        state.items.unshift(action.payload);
      },
      prepare: (payload: { name: string; description: string }) => ({
        payload: {
          id: `group-created-${Date.now()}`,
          name: payload.name.trim(),
          description: payload.description.trim(),
          members: 1,
          balance: 0,
          inviteCode: buildInviteCode(payload.name),
          source: 'created' as const,
        },
      }),
    },
    joinGroup: (state, action: PayloadAction<DemoGroupItem>) => {
      const exists = state.items.some((group) => group.inviteCode === action.payload.inviteCode);
      if (!exists) {
        state.items.unshift(action.payload);
      }
    },
  },
});

export const { createGroup, joinGroup } = groupsSlice.actions;
export const groupsReducer = groupsSlice.reducer;
