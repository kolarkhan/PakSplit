import { ExpenseModel } from '../models/Expense';

export class ExpenseRepository {
  create(payload: Record<string, unknown>) {
    return ExpenseModel.create(payload);
  }

  findByGroup(groupId: string) {
    return ExpenseModel.find({ groupId }).sort({ expenseDate: -1 }).lean();
  }

  findByGroupSince(groupId: string, since: Date) {
    return ExpenseModel.find({ groupId, expenseDate: { $gte: since } }).sort({ expenseDate: -1, createdAt: -1 }).lean();
  }

  findRecentByGroupIds(groupIds: string[], limit = 6) {
    return ExpenseModel.find({ groupId: { $in: groupIds } })
      .populate('groupId', 'name')
      .sort({ expenseDate: -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }

  findRecentByGroupIdsExpanded(groupIds: string[], limit = 50) {
    return ExpenseModel.find({ groupId: { $in: groupIds } })
      .populate('groupId', 'name')
      .sort({ expenseDate: -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }

  findById(expenseId: string) {
    return ExpenseModel.findById(expenseId).lean();
  }

  update(expenseId: string, payload: Record<string, unknown>) {
    return ExpenseModel.findByIdAndUpdate(expenseId, payload, { new: true }).lean();
  }

  delete(expenseId: string) {
    return ExpenseModel.findByIdAndDelete(expenseId).lean();
  }
}
