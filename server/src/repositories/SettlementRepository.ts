import { SettlementModel } from '../models/Settlement';

export class SettlementRepository {
  create(payload: Record<string, unknown>) {
    return SettlementModel.create(payload);
  }

  findByGroup(groupId: string) {
    return SettlementModel.find({ groupId }).sort({ createdAt: -1 }).lean();
  }

  findById(settlementId: string) {
    return SettlementModel.findById(settlementId).lean();
  }

  update(settlementId: string, payload: Record<string, unknown>) {
    return SettlementModel.findByIdAndUpdate(settlementId, payload, { new: true }).lean();
  }
}
