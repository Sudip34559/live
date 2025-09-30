import { Schema, model, Document, Types, models } from "mongoose";

export type ClientStatus = "pending" | "active" | "suspended" | "inactive";

export interface IClient extends Document {
  userId: Types.ObjectId; // Reference to User model
  hostId: Types.ObjectId; // Reference to Host model (many clients to one host)
  clientCode?: string; // Optional unique client identifier
  joinedAt: Date;
  status: ClientStatus;
  permissions: {
    canCreateRooms: boolean;
    canJoinRooms: boolean;
    canInviteOthers: boolean;
    canAccessRecordings: boolean;
  };
  metadata: {
    department?: string;
    role?: string;
    notes?: string;
    tags: string[];
  };
  lastActiveAt?: Date;
  invitedBy?: Types.ObjectId; // Reference to User who invited this client
  createdAt: Date;
  updatedAt: Date;
}

const ClientSchema = new Schema<IClient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hostId: {
      type: Schema.Types.ObjectId,
      ref: "Host",
      required: true,
    },
    clientCode: {
      type: String,
      unique: true,
      sparse: true, // Allow null values but ensure uniqueness when present
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "active", "suspended", "inactive"],
      default: "active",
    },
    permissions: {
      canCreateRooms: {
        type: Boolean,
        default: false,
      },
      canJoinRooms: {
        type: Boolean,
        default: true,
      },
      canInviteOthers: {
        type: Boolean,
        default: false,
      },
      canAccessRecordings: {
        type: Boolean,
        default: false,
      },
    },
    metadata: {
      department: {
        type: String,
        trim: true,
      },
      role: {
        type: String,
        trim: true,
      },
      notes: {
        type: String,
        maxlength: 1000,
      },
      tags: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    lastActiveAt: {
      type: Date,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Compound index to ensure one user can only be a client of a host once
ClientSchema.index({ userId: 1, hostId: 1 }, { unique: true });

// Generate client code if needed
ClientSchema.pre("save", async function (next) {
  if (!this.clientCode) {
    let newCode;
    let exists = true;

    while (exists) {
      newCode = generateClientCode();
      const existing = await Client.findOne({ clientCode: newCode });
      if (!existing) {
        exists = false;
        this.clientCode = newCode;
      }
    }
  }
  next();
});

function generateClientCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "C"; // Prefix with 'C' for Client
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const Client = models.Client || model<IClient>("Client", ClientSchema);
