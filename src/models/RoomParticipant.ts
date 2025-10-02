import { Schema, model, Document, Types, models } from "mongoose";

export type ParticipantRole = "host" | "cohost" | "member" | "guest";
export type ParticipantStatus =
  | "invited"
  | "waiting"
  | "approved"
  | "joined"
  | "blocked";

export interface IRoomParticipant extends Document {
  room: Types.ObjectId;
  user?: Types.ObjectId;
  role: ParticipantRole;
  status: ParticipantStatus;
  joinedAt?: Date;
  leftAt?: Date;
}

const RoomParticipantSchema = new Schema<IRoomParticipant>(
  {
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User"},
    role: {
      type: String,
      enum: ["host", "cohost", "member", "guest"],
      default: "member",
    },
    status: {
      type: String,
      enum: ["invited", "waiting", "approved", "joined", "blocked"],
      default: "invited",
    },
    joinedAt: { type: Date },
    leftAt: { type: Date },
  },
  { timestamps: true }
);

export const RoomParticipant =
  models.RoomParticipant ||
  model<IRoomParticipant>("RoomParticipant", RoomParticipantSchema);
