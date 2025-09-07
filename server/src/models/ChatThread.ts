import mongoose, { Document, Schema } from "mongoose";

export interface IChatThread extends Document {
  title: string;
  createdAt: Date;
  lastMessageAt: Date;
  messageCount: number;
}

const ChatThreadSchema = new Schema<IChatThread>({
  title: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastMessageAt: { type: Date, default: Date.now },
  messageCount: { type: Number, default: 0 }
});

export default mongoose.model<IChatThread>("ChatThread", ChatThreadSchema);
