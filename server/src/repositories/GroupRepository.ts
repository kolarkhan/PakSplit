import { GroupModel } from '../models/Group';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class GroupRepository {
  create(payload: Record<string, unknown>) {
    return GroupModel.create(payload);
  }

  findForUser(userId: string) {
    return GroupModel.find({ 'members.userId': userId, 'members.status': 'active' })
      .populate('members.userId', 'fullName email avatarUrl')
      .sort({ updatedAt: -1 })
      .lean();
  }

  findById(groupId: string) {
    return GroupModel.findById(groupId).populate('members.userId', 'fullName email avatarUrl').lean();
  }

  findByInviteCode(inviteCode: string) {
    return GroupModel.findOne({ inviteCode: { $regex: `^${escapeRegex(inviteCode)}$`, $options: 'i' } }).lean();
  }

  update(groupId: string, payload: Record<string, unknown>) {
    return GroupModel.findByIdAndUpdate(groupId, payload, { new: true }).lean();
  }

  delete(groupId: string) {
    return GroupModel.findByIdAndDelete(groupId).lean();
  }
}
