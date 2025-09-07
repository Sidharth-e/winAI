import mongoose, { Document, Schema } from "mongoose";

export interface IChatMessage extends Document {
  threadId: mongoose.Types.ObjectId;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>({
  threadId: { type: Schema.Types.ObjectId, ref: 'ChatThread', required: true },
  content: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  timestamp: { type: Date, default: Date.now }
});

// Create index for efficient querying by threadId
ChatMessageSchema.index({ threadId: 1, timestamp: 1 });

export default mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
