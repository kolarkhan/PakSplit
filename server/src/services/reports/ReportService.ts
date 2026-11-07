import { ExpenseRepository } from '../../repositories/ExpenseRepository';

export class ReportService {
  private readonly expenseRepository = new ExpenseRepository();

  async monthly(userId: string, groupIds: string[]) {
    const grouped = await Promise.all(groupIds.map((groupId) => this.expenseRepository.findByGroup(groupId)));
    const expenses = grouped.flat();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyExpenses = expenses.filter((expense) => {
      const date = new Date(expense.expenseDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const categoryTotals = monthlyExpenses.reduce<Record<string, number>>((accumulator, expense) => {
      accumulator[expense.category] = (accumulator[expense.category] ?? 0) + expense.totalAmount;
      return accumulator;
    }, {});

    return {
      userId,
      totalSpend: monthlyExpenses.reduce((sum, expense) => sum + expense.totalAmount, 0),
      categoryTotals,
      placeholders: {
        pdfExport: 'TODO',
        recurringInsights: 'TODO',
      },
    };
  }

  async group(groupId: string) {
    const expenses = await this.expenseRepository.findByGroup(groupId);
    return {
      groupId,
      expenseCount: expenses.length,
      totalSpend: expenses.reduce((sum, expense) => sum + expense.totalAmount, 0),
      mostRecentExpense: expenses[0] ?? null,
    };
  }

  async exportCsv(groupId: string) {
    const expenses = await this.expenseRepository.findByGroup(groupId);
    const headers = ['title', 'category', 'totalAmount', 'paidBy', 'expenseDate'];
    const rows = expenses.map((expense) =>
      [expense.title, expense.category, expense.totalAmount, expense.paidBy.toString(), expense.expenseDate].join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }
}
