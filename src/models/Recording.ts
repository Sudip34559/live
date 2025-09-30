import { Schema, model, Document, Types, models } from "mongoose";

export type RecordingFormat = "mp4" | "hls";

export interface IRecording extends Document {
  room: Types.ObjectId;
  s3Url: string;
  format: RecordingFormat;
  duration?: number;
  size?: number;
  createdAt: Date;
}

const RecordingSchema = new Schema<IRecording>(
  {
    room: { type: Schema.Types.ObjectId, ref: "Room", required: true },
    s3Url: { type: String, required: true },
    format: { type: String, enum: ["mp4", "hls"], default: "mp4" },
    duration: { type: Number },
    size: { type: Number },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Recording =
  models.Recording || model<IRecording>("Recording", RecordingSchema);
