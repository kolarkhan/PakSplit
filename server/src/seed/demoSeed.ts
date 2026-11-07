export const demoSeedData = {
  users: [
    { fullName: 'Ali Raza', email: 'ali@example.com', phone: '03001234567' },
    { fullName: 'Ahmed Khan', email: 'ahmed@example.com', phone: '03111234567' },
    { fullName: 'Sana Fatima', email: 'sana@example.com', phone: '03211234567' },
    { fullName: 'Hira Noor', email: 'hira@example.com', phone: '03331234567' },
    { fullName: 'Usman Tariq', email: 'usman@example.com', phone: '03451234567' },
    { fullName: 'Fatima Zahra', email: 'fatima@example.com', phone: '03059876543' },
  ],
  groups: [
    { name: 'Murree Trip Crew', description: 'Transport, chai, snacks, and stay.' },
    { name: 'Flat 304 Bills', description: 'Rent, utilities, groceries, and shared household costs.' },
  ],
  expenses: [
    { title: 'Dinner at Monal', totalAmount: 4000, category: 'food' },
    { title: 'Petrol Refill', totalAmount: 6500, category: 'fuel' },
    { title: 'Monthly Internet Bill', totalAmount: 3200, category: 'utility_bills' },
  ],
  settlements: [{ method: 'easypaisa', amount: 1000 }, { method: 'raast', amount: 2500 }],
};
