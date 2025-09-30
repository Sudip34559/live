import z from "zod";

// Validation schemas
export const MoneySchema = z.object({
  currency: z.enum(["USD", "EUR", "INR"]).default("USD"),
  amount: z.number().min(0),
});

export const PricingSchema = z.object({
  USD: z.object({
    monthly: MoneySchema.default({ currency: "USD", amount: 0 }),
    yearly: MoneySchema.default({ currency: "USD", amount: 0 }),
  }),
  INR: z.object({
    monthly: MoneySchema.default({ currency: "INR", amount: 0 }),
    yearly: MoneySchema.default({ currency: "INR", amount: 0 }),
  }),
  EUR: z.object({
    monthly: MoneySchema.default({ currency: "EUR", amount: 0 }),
    yearly: MoneySchema.default({ currency: "EUR", amount: 0 }),
  }),
});

export const planSchema = z.object({
  planKey: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  isRecomended: z.boolean().default(false),
  pricing: PricingSchema,
  perHost: z.boolean().default(true),
  requiresQuote: z.boolean().default(false),
  features: z.object({
    watermark: z.boolean().default(true),
    customBranding: z.boolean().default(false),
    recording: z.boolean().default(false),
    transcription: z.boolean().default(false),
    aiNotes: z.boolean().default(false),
    breakoutRooms: z.boolean().default(false),
    rtmpOut: z.boolean().default(false),
    apiAccess: z.boolean().default(false),
    webhooks: z.boolean().default(false),
    sso: z.boolean().default(false),
    scim: z.boolean().default(false),
    analytics: z.boolean().default(false),
    advancedAnalytics: z.boolean().default(false),
    e2ee: z.boolean().default(true),
    dataResidency: z.boolean().default(false),
    whiteLabel: z.boolean().default(false),
    onPrem: z.boolean().default(false),
  }),
  limits: z.object({
    meetingDurationMin: z.number().default(-1),
    participantsMax: z.number().default(30),
    concurrentMeetingsMax: z.number().default(1),
    storageGb: z.number().default(5),
    transcriptMinutes: z.number().default(100),
    apiCallsPerDay: z.number().default(0),
    rtmpDestinationsIncluded: z.number().default(0),
    webhookEndpointsMax: z.number().default(0),
  }),
  isPublic: z.boolean().default(true),
  isActive: z.boolean().default(true),
  order: z.number().default(0),
});

export type IPlan = z.infer<typeof planSchema>;
