import mongoose, { model, models, Schema, Types } from "mongoose";

export type PlanTier = "free" | "pro" | "business" | "enterprise";
export type PriceCadence = "monthly" | "yearly";
export type LimitUnit =
  | "minutes"
  | "participants"
  | "gb"
  | "api-calls"
  | "webhooks-per-min"
  | "rtmp-destinations"
  | "meetings-concurrent"
  | "endpoints"
  | "transcript-minutes";

const MoneySchema = new Schema(
  {
    currency: { type: String, enum: ["USD", "EUR", "INR"], default: "USD" },
    amount: { type: Number, min: 0, required: true }, // cents/minor units
  },
  { _id: false }
);

const PricingSchema = new Schema(
  {
    USD: {
      monthly: { type: MoneySchema, default: { currency: "USD", amount: 0 } },
      yearly: { type: MoneySchema, default: { currency: "USD", amount: 0 } },
    },
    INR: {
      monthly: { type: MoneySchema, default: { currency: "INR", amount: 0 } },
      yearly: { type: MoneySchema, default: { currency: "INR", amount: 0 } },
    },
    EUR: {
      monthly: { type: MoneySchema, default: { currency: "EUR", amount: 0 } },
      yearly: { type: MoneySchema, default: { currency: "EUR", amount: 0 } },
    },
  },
  { _id: false }
);

const OverageSchema = new Schema(
  {
    unit: { type: String, required: true }, // e.g., 'gb', 'transcript-minutes'
    pricePerUnit: { type: MoneySchema, required: true },
    freeAllowance: { type: Number, default: 0 }, // optional extra buffer
    billingGranularity: { type: Number, default: 1 }, // e.g., 1 GB, 1 minute
  },
  { _id: false }
);

const RateLimitSchema = new Schema(
  {
    key: { type: String, required: true }, // 'api' | 'webhook'
    limit: { type: Number, required: true },
    windowSec: { type: Number, required: true }, // 60 for per‑min
    burst: { type: Number, default: 0 }, // optional token bucket burst
  },
  { _id: false }
);

const FeatureFlagsSchema = new Schema(
  {
    watermark: { type: Boolean, default: true },
    customBranding: { type: Boolean, default: false },
    recording: { type: Boolean, default: false },
    transcription: { type: Boolean, default: false },
    aiNotes: { type: Boolean, default: false },
    breakoutRooms: { type: Boolean, default: false },
    rtmpOut: { type: Boolean, default: false },
    apiAccess: { type: Boolean, default: false },
    webhooks: { type: Boolean, default: false },
    sso: { type: Boolean, default: false },
    scim: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    advancedAnalytics: { type: Boolean, default: false },
    e2ee: { type: Boolean, default: true },
    dataResidency: { type: Boolean, default: false },
    whiteLabel: { type: Boolean, default: false },
    onPrem: { type: Boolean, default: false },
  },
  { _id: false }
);

const LimitsSchema = new Schema(
  {
    meetingDurationMin: { type: Number, default: -1 }, // -1 = unlimited
    participantsMax: { type: Number, default: 30 },
    concurrentMeetingsMax: { type: Number, default: 1 },
    storageGb: { type: Number, default: 5 },
    transcriptMinutes: { type: Number, default: 100 },
    apiCallsPerDay: { type: Number, default: 0 },
    rtmpDestinationsIncluded: { type: Number, default: 0 },
    webhookEndpointsMax: { type: Number, default: 0 },
  },
  { _id: false }
);

const SLAConfigSchema = new Schema(
  {
    uptimeTarget: { type: String, default: "best-effort" }, // '99.5%', '99.9%', '99.99%'
    p1ResponseMins: { type: Number, default: 0 },
    supportChannels: [{ type: String }], // ['community','email','chat','24x7','TAM']
  },
  { _id: false }
);

const AddOnSchema = new Schema(
  {
    code: { type: String, required: true }, // e.g., 'large-meeting', 'storage-pack'
    name: { type: String, required: true },
    description: { type: String },
    pricing: { type: PricingSchema, required: true },
    config: { type: Schema.Types.Mixed }, // e.g., { extraParticipants: 500 }
    metered: { type: Boolean, default: false },
    overage: { type: OverageSchema },
    enabledByDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const CalendarSchema = new Schema(
  {
    google: { type: Boolean, default: false },
    microsoft: { type: Boolean, default: false },
  },
  { _id: false }
);

const PlanSchema = new Schema(
  {
    planKey: {
      type: String,
      unique: true,
      required: true,
    },
    name: { type: String, required: true }, // 'Free', 'Pro', 'Business', 'Enterprise'
    description: { type: String },

    isRecomended: {
      type: Boolean,
      default: false,
    },

    // Pricing
    pricing: { type: PricingSchema, required: true },
    perHost: { type: Boolean, default: true },
    requiresQuote: { type: Boolean, default: false }, // enterprise

    // Features and limits
    features: { type: FeatureFlagsSchema, required: true },
    limits: { type: LimitsSchema, required: true },
    rateLimits: [RateLimitSchema], // e.g., webhooks per minute
    overages: [OverageSchema], // storage GB, transcript minutes, extra RTMP destinations

    // Integrations
    integrations: {
      calendar: { type: CalendarSchema, default: {} },
      // extend later (CRM, LMS, etc.)
    },

    // SLAs and compliance
    sla: { type: SLAConfigSchema, default: {} },
    compliance: {
      hipaa: { type: Boolean, default: false },
      soc2: { type: Boolean, default: false },
      gdprDPA: { type: Boolean, default: false },
      residencyRegions: [{ type: String }], // ['EU','US','IN']
      baaAvailable: { type: Boolean, default: false },
    },

    // Add-ons catalog visible to this plan
    addOns: [AddOnSchema],

    // Operational flags
    isPublic: { type: Boolean, default: true }, // visible on pricing page
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // display order

    // Audit
    createdBy: { type: Types.ObjectId, ref: "User" },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Indexes
PlanSchema.index({ key: 1 }, { unique: true });
PlanSchema.index({ isActive: 1, isPublic: 1, order: 1 });

export const Plan = models.Plan || model("Plan", PlanSchema);
