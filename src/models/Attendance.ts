import { Schema, model, Document, Types, models } from "mongoose";

export interface IAttendance extends Document {
  room: Types.ObjectId;
  user: Types.ObjectId;
  role: "host" | "cohost" | "member" | "guest";
  joinTime: Date;
  leaveTime?: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["host", "cohost", "member", "guest"],
      required: true,
    },
    joinTime: { type: Date, default: Date.now },
    leaveTime: { type: Date },
  },
  { timestamps: true }
);

export const Attendance =
  models.Attendance || model<IAttendance>("Attendance", AttendanceSchema);
