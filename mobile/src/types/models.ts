export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaymentMethod {
  _id?: string;
  type: 'easypaisa' | 'jazzcash' | 'raast' | 'bank' | 'cash';
  label: string;
  accountTitle?: string;
  phoneNumber?: string;
  bankName?: string;
  accountNumberMasked?: string;
  ibanMasked?: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  preferredCurrency?: string;
  preferredLanguage?: string;
  paymentMethods?: PaymentMethod[];
}

export interface GroupMemberUserRef {
  _id: string;
  fullName: string;
  email?: string;
  avatarUrl?: string;
}

export interface GroupMember {
  userId: string | GroupMemberUserRef;
  role: 'admin' | 'member';
  status: 'active' | 'pending' | 'invited' | 'removed';
  availabilityStatus?: 'active' | 'unavailable';
  unavailableFrom?: string;
  unavailableUntil?: string;
  availabilityNote?: string;
  excludeFromNewExpenses?: boolean;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  inviteCode: string;
  members?: GroupMember[];
  balance?: number;
  createdBy?: string;
}

export interface Expense {
  _id: string;
  groupId?: string | { _id: string; name?: string };
  title: string;
  category: string;
  totalAmount: number;
  expenseDate: string;
  paidBy?: string;
  splitType?: string;
  notes?: string;
}

export interface TopDuePerson {
  userId: string;
  fullName: string;
  avatarUrl?: string;
  amount: number;
  direction: 'owe' | 'owed';
}

export interface OverallBalanceSummary {
  youOwe: number;
  youAreOwed: number;
  netBalance: number;
  topDuePerson?: TopDuePerson | null;
}

export interface GroupBalanceSummaryResponse {
  summary?: {
    youOwe: number;
    youAreOwed: number;
    netBalance: number;
  };
  ledger?: Array<{
    fromUserId: string;
    toUserId: string;
    amount: number;
  }>;
}

export interface Settlement {
  _id: string;
  groupId?: string;
  amount: number;
  currency?: string;
  method: string;
  status: 'pending' | 'completed' | 'cancelled';
  note?: string;
  transactionReference?: string;
  createdAt?: string;
}

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface GroupActivity {
  _id: string;
  groupId: string;
  actorUserId: string;
  type: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  subtitle: string;
}
