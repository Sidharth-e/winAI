import mongoose, { Document, Schema } from "mongoose";

export interface IReminder extends Document {
  title: string;
  message: string;
  time: Date;
}

const ReminderSchema = new Schema<IReminder>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: Date, required: true }
});

export default mongoose.model<IReminder>("Reminder", ReminderSchema);
