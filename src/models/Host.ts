import { Schema, model, Document, Types, models } from "mongoose";

export interface IHost extends Document {
  userId: Types.ObjectId; // Reference to User model
  hostCode: string; // Unique host identifier
  businessName?: string;
  businessType?: string;
  description?: string;
  isActive: boolean;
  maxClients?: number;
  subscription: {
    plan: "free" | "basic" | "premium" | "enterprise";
    expiresAt?: Date;
    features: string[];
  };
  settings: {
    autoAcceptClients: boolean;
    allowClientInvites: boolean;
    requireClientVerification: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const HostSchema = new Schema<IHost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    hostCode: {
      type: String,
      unique: true,
      uppercase: true,
      match: /^[A-Z0-9]{6,10}$/,
    },
    businessName: {
      type: String,
      trim: true,
    },
    businessType: {
      type: String,
      enum: [
        "education",
        "healthcare",
        "corporate",
        "consulting",
        "technology",
        "marketing",
        "finance",
        "other",
      ],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    maxClients: {
      type: Number,
      default: 10,
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium", "enterprise"],
        default: "free",
      },
      expiresAt: {
        type: Date,
      },
      features: [
        {
          type: String,
        },
      ],
    },
    settings: {
      autoAcceptClients: {
        type: Boolean,
        default: false,
      },
      allowClientInvites: {
        type: Boolean,
        default: true,
      },
      requireClientVerification: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

// Generate unique host code
HostSchema.pre("save", async function (next) {
  if (!this.hostCode) {
    let newCode;
    let exists = true;

    while (exists) {
      newCode = generateHostCode();
      const existing = await Host.findOne({ hostCode: newCode });
      if (!existing) {
        exists = false;
        this.hostCode = newCode;
      }
    }
  }
  next();
});

function generateHostCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const Host = models.Host || model<IHost>("Host", HostSchema);
