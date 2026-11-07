import { Schema, model } from 'mongoose';

const activityLogSchema = new Schema(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    actorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const ActivityLogModel = model('ActivityLog', activityLogSchema);
