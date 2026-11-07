import { Schema, model, type InferSchemaType } from 'mongoose';

const groupMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'pending', 'invited', 'removed'], default: 'active' },
    availabilityStatus: { type: String, enum: ['active', 'unavailable'], default: 'active' },
    unavailableFrom: { type: Date },
    unavailableUntil: { type: Date },
    availabilityNote: { type: String, trim: true, maxlength: 180 },
    excludeFromNewExpenses: { type: Boolean, default: true },
  },
  { _id: false },
);

const groupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 280 },
    avatarUrl: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    members: { type: [groupMemberSchema], default: [] },
    inviteCode: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true },
);

groupSchema.index({ 'members.userId': 1 });

export type GroupDocument = InferSchemaType<typeof groupSchema>;
export const GroupModel = model('Group', groupSchema);
