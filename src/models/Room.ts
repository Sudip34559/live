import { Schema, model, Document, Types, models } from "mongoose";

export type RoomType = "classroom" | "meeting" | "webinar" | "event";
export type RoomStatus = "scheduled" | "live" | "completed" | "cancelled";

export interface IRoom extends Document {
  title: string;
  description?: string;
  roomType: RoomType;
  createdBy: Types.ObjectId; // User who created the room
  hostId?: Types.ObjectId; // Host organization (optional)
  allowedClients?: Types.ObjectId[]; // Array of Client IDs allowed to join
  roomName: string; // unique Jitsi room name
  date: Date;
  startTime: string;
  endTime: string;
  endDate?: Date;
  status: RoomStatus;
  isPublic: boolean;
  maxParticipants?: number;
  participentCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    roomType: {
      type: String,
      enum: ["classroom", "meeting", "webinar", "event"],
      required: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    hostId: { type: Schema.Types.ObjectId, ref: "Host" },
    allowedClients: [{ type: Schema.Types.ObjectId, ref: "Client" }],
    roomName: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    endDate: {
      type: Date,
      default: function (this: IRoom) {
        return this.date;
      },
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },
    isPublic: { type: Boolean, default: false },
    maxParticipants: { type: Number, default: 20 },
    participentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Room = models.Room || model<IRoom>("Room", RoomSchema);
