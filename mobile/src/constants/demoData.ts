export const demoDashboard = {
  totals: {
    youOwe: 6200,
    youAreOwed: 12800,
    netBalance: 6600,
  },
  groups: [
    { id: '1', name: 'Murree Trip Crew', balance: 4200, members: 5, accent: '#2AB6FF' },
    { id: '2', name: 'Flat 304 Bills', balance: -1800, members: 4, accent: '#19B36B' },
  ],
  expenses: [
    { id: '1', title: 'Dinner at Monal', category: 'Food', totalAmount: 4000, expenseDate: '2026-04-21T00:00:00.000Z' },
    { id: '2', title: 'Internet Bill', category: 'Utility Bills', totalAmount: 3200, expenseDate: '2026-04-18T00:00:00.000Z' },
  ],
  settlements: [
    { id: '1', amount: 2500, method: 'Raast', status: 'pending' },
    { id: '2', amount: 1000, method: 'EasyPaisa', status: 'completed' },
  ],
};
