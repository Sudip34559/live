// =====================================================================
// SUB-SCHEMAS FOR COMPLEX NESTED OBJECTS
// =====================================================================

import { model, Model, models, Schema } from "mongoose";

// API Configuration Sub-schemas
const CustomButtonSchema = new Schema(
  {
    icon: { type: String, required: true }, // base64 or path to image
    id: { type: String, required: true },
    text: { type: String, required: true },
    backgroundColor: String, // for toolbar buttons only
  },
  { _id: false }
);

const ButtonNotifyClickSchema = new Schema(
  {
    key: { type: String, required: true },
    preventExecution: { type: Boolean, default: false },
  },
  { _id: false }
);

// Connection Configuration Sub-schemas
const HostsSchema = new Schema(
  {
    domain: { type: String, required: true },
    anonymousdomain: String,
    authdomain: String,
    focus: String,
    muc: String,
  },
  { _id: false }
);

const BridgeChannelSchema = new Schema(
  {
    ignoreDomain: String,
    preferSctp: { type: Boolean, default: false },
  },
  { _id: false }
);

// Audio Configuration Sub-schemas
const AudioQualitySchema = new Schema(
  {
    stereo: { type: Boolean, default: false },
    opusMaxAverageBitrate: { type: Number, min: 6000, max: 510000 },
    enableOpusDtx: { type: Boolean, default: false },
  },
  { _id: false }
);

const NoiseSuppressionKrispSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    logProcessStats: { type: Boolean, default: false },
    debugLogs: { type: Boolean, default: false },
    useBVC: { type: Boolean, default: false },
    bufferOverflowMS: { type: Number, default: 1000 },
    inboundModels: {
      modelInbound8: { type: String, default: "model_inbound_8.kef" },
      modelInbound16: { type: String, default: "model_inbound_16.kef" },
    },
    preloadInboundModels: {
      modelInbound8: { type: String, default: "model_inbound_8.kef" },
      modelInbound16: { type: String, default: "model_inbound_16.kef" },
    },
    preloadModels: {
      modelBVC: { type: String, default: "model_bvc.kef" },
      model8: { type: String, default: "model_8.kef" },
      modelNC: { type: String, default: "model_nc_mq.kef" },
    },
    models: {
      modelBVC: { type: String, default: "model_bvc.kef" },
      model8: { type: String, default: "model_8.kef" },
      modelNV: { type: String, default: "model_nc_mq.kef" },
    },
    bvc: {
      allowedDevices: { type: String, default: "bvc-allowed.txt" },
      allowedDevicesExt: { type: String, default: "bvc-allowed-ext.txt" },
    },
  },
  { _id: false }
);

const NoiseSuppressionSchema = new Schema(
  {
    krisp: NoiseSuppressionKrispSchema,
  },
  { _id: false }
);

const SpeakerStatsSchema = new Schema(
  {
    disabled: { type: Boolean, default: false },
    disableSearch: { type: Boolean, default: false },
    order: [
      {
        type: String,
        enum: ["role", "name", "hasLeft"],
        default: ["role", "name", "hasLeft"],
      },
    ],
  },
  { _id: false }
);

// Video Configuration Sub-schemas
const VideoConstraintsSchema = new Schema(
  {
    video: {
      height: {
        ideal: { type: Number, default: 720 },
        max: { type: Number, default: 720 },
        min: { type: Number, default: 240 },
      },
      width: {
        ideal: { type: Number, default: 1280 },
        max: { type: Number, default: 1280 },
        min: { type: Number, default: 320 },
      },
    },
  },
  { _id: false }
);

const CodecVideoQualitySchema = new Schema(
  {
    maxBitratesVideo: {
      low: Number,
      standard: Number,
      high: Number,
      fullHd: Number,
      ultraHd: Number,
      ssHigh: Number,
    },
    scalabilityModeEnabled: Boolean,
    useSimulcast: Boolean,
    useKSVC: Boolean,
  },
  { _id: false }
);

const VideoQualitySchema = new Schema(
  {
    codecPreferenceOrder: [
      { type: String, enum: ["AV1", "VP9", "VP8", "H264"] },
    ],
    screenshareCodec: { type: String, enum: ["AV1", "VP9", "VP8", "H264"] },
    mobileScreenshareCodec: {
      type: String,
      enum: ["AV1", "VP9", "VP8", "H264"],
    },
    enableAdaptiveMode: { type: Boolean, default: false },
    av1: CodecVideoQualitySchema,
    h264: CodecVideoQualitySchema,
    vp8: CodecVideoQualitySchema,
    vp9: CodecVideoQualitySchema,
    minHeightForQualityLvl: {
      360: {
        type: String,
        enum: ["low", "standard", "high"],
        default: "standard",
      },
      720: { type: String, enum: ["low", "standard", "high"], default: "high" },
    },
    mobileCodecPreferenceOrder: [
      { type: String, enum: ["VP8", "VP9", "H264", "AV1"] },
    ],
  },
  { _id: false }
);

// P2P Configuration
const StunServerSchema = new Schema(
  {
    urls: { type: String, required: true },
    username: String,
    credential: String,
  },
  { _id: false }
);

const P2PSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    iceTransportPolicy: {
      type: String,
      enum: ["all", "relay"],
      default: "all",
    },
    mobileCodecPreferenceOrder: [
      { type: String, enum: ["H264", "VP8", "VP9", "AV1"] },
    ],
    codecPreferenceOrder: [
      { type: String, enum: ["AV1", "VP9", "VP8", "H264"] },
    ],
    screenshareCodec: { type: String, enum: ["AV1", "VP9", "VP8", "H264"] },
    mobileScreenshareCodec: {
      type: String,
      enum: ["AV1", "VP9", "VP8", "H264"],
    },
    backToP2PDelay: { type: Number, default: 5 },
    stunServers: [StunServerSchema],
  },
  { _id: false }
);

// Recording Configuration Sub-schemas
const DropboxSchema = new Schema(
  {
    appKey: String,
    redirectURI: String,
  },
  { _id: false }
);

const RecordingsSchema = new Schema(
  {
    recordAudioAndVideo: { type: Boolean, default: true },
    suggestRecording: { type: Boolean, default: false },
    showPrejoinWarning: { type: Boolean, default: true },
    showRecordingLink: { type: Boolean, default: true },
    requireConsent: { type: Boolean, default: false },
    skipConsentInMeeting: { type: Boolean, default: false },
    consentLearnMoreLink: {
      type: String,
      default: "https://jitsi.org/meet/consent",
    },
  },
  { _id: false }
);

const LocalRecordingSchema = new Schema(
  {
    disable: { type: Boolean, default: false },
    notifyAllParticipants: { type: Boolean, default: false },
    disableSelfRecording: { type: Boolean, default: false },
  },
  { _id: false }
);

// UI Configuration Sub-schemas
const LobbySchema = new Schema(
  {
    autoKnock: { type: Boolean, default: false },
    enableChat: { type: Boolean, default: true },
    showHangUp: { type: Boolean, default: true },
  },
  { _id: false }
);

const FilmstripSchema = new Schema(
  {
    disabled: { type: Boolean, default: false },
    disableResizable: { type: Boolean, default: false },
    disableStageFilmstrip: { type: Boolean, default: false },
    stageFilmstripParticipants: { type: Number, min: 1, max: 6, default: 1 },
    disableTopPanel: { type: Boolean, default: false },
    minParticipantCountForTopPanel: { type: Number, default: 50 },
    initialWidth: { type: Number, default: 400 },
  },
  { _id: false }
);

// Security Configuration Sub-schemas
const E2EELabelsSchema = new Schema(
  {
    labelTooltip: String,
    description: String,
    label: { type: String, default: "E2EE" },
    warning: String,
  },
  { _id: false }
);

const E2EESchema = new Schema(
  {
    labels: E2EELabelsSchema,
    externallyManagedKey: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  { _id: false }
);

const SecurityUISchema = new Schema(
  {
    hideLobbyButton: { type: Boolean, default: false },
    disableLobbyPassword: { type: Boolean, default: false },
  },
  { _id: false }
);

// Transcription Configuration
const TranscriptionSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    translationLanguages: [String],
    translationLanguagesHead: [String],
    useAppLanguage: { type: Boolean, default: true },
    preferredLanguage: { type: String, default: "en-US" },
    autoTranscribeOnRecord: { type: Boolean, default: false },
    autoCaptionOnTranscribe: { type: Boolean, default: false },
    disableClosedCaptions: { type: Boolean, default: false },
  },
  { _id: false }
);

// Breakout Rooms Configuration
const BreakoutRoomsSchema = new Schema(
  {
    hideAddRoomButton: { type: Boolean, default: false },
    hideAutoAssignButton: { type: Boolean, default: false },
    hideJoinRoomButton: { type: Boolean, default: false },
    hideModeratorSettingsTab: { type: Boolean, default: false },
    hideMoreActionsButton: { type: Boolean, default: false },
    hideMuteAllButton: { type: Boolean, default: false },
  },
  { _id: false }
);

// Participants Configuration
const ParticipantsPaneSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    hideModeratorSettingsTab: { type: Boolean, default: false },
    hideMoreActionsButton: { type: Boolean, default: false },
    hideMuteAllButton: { type: Boolean, default: false },
  },
  { _id: false }
);

// Testing Configuration
const TestingSchema = new Schema(
  {
    assumeBandwidth: { type: Boolean, default: false },
    p2pTestMode: { type: Boolean, default: false },
    testMode: { type: Boolean, default: false },
    noAutoPlayVideo: { type: Boolean, default: false },
  },
  { _id: false }
);

// Analytics Configuration
const CallStatsConfigParamsSchema = new Schema(
  {
    disableBeforeUnloadHandler: Boolean,
    applicationVersion: String,
    disablePrecalltest: Boolean,
    siteID: String,
    additionalIDs: {
      customerID: String,
      tenantID: String,
      productName: String,
      meetingsName: String,
      serverName: String,
      pbxID: String,
      pbxExtensionID: String,
      fqExtensionID: String,
      sessionID: String,
    },
    collectLegacyStats: Boolean,
    collectIP: Boolean,
  },
  { _id: false }
);

// Integration Configurations
const GiphySchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    sdkKey: String,
    displayMode: {
      type: String,
      enum: ["tile", "chat", "all"],
      default: "all",
    },
    tileTime: { type: Number, default: 5000 },
    rating: {
      type: String,
      enum: ["g", "pg", "pg-13", "r"],
      default: "pg",
    },
  },
  { _id: false }
);

// Face Landmarks Configuration
const FaceLandmarksSchema = new Schema(
  {
    enableFaceCentering: { type: Boolean, default: false },
    enableFaceExpressionsDetection: { type: Boolean, default: false },
    enableDisplayFaceExpressions: { type: Boolean, default: false },
    enableRTCStats: { type: Boolean, default: false },
    faceCenteringThreshold: { type: Number, default: 10 },
    captureInterval: { type: Number, default: 1000 },
  },
  { _id: false }
);

// =====================================================================
// MAIN JITSI CONFIGURATION SCHEMA
// =====================================================================

const JitsiConfigSchema = new Schema(
  {
    // ===== Basic Information =====
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===== Connection Configuration =====
    hosts: HostsSchema,
    bosh: String,
    websocket: String,
    websocketKeepAliveUrl: String,
    preferBosh: Boolean,
    focusUserJid: String,
    conferenceRequestUrl: String,
    bridgeChannel: BridgeChannelSchema,

    // ===== Testing & Experimental =====
    testing: TestingSchema,

    // ===== Audio Configuration =====
    disableAudioLevels: { type: Boolean, default: false },
    audioLevelsInterval: { type: Number, default: 200, min: 50 },
    enableNoAudioDetection: { type: Boolean, default: true },
    enableNoisyMicDetection: { type: Boolean, default: true },
    startAudioOnly: Boolean,
    startAudioMuted: { type: Number, min: 1 },
    startWithAudioMuted: Boolean,
    startSilent: Boolean,
    enableOpusRed: { type: Boolean, default: false },
    audioQuality: AudioQualitySchema,
    noiseSuppression: NoiseSuppressionSchema,
    speakerStats: SpeakerStatsSchema,

    // ===== Video Configuration =====
    cameraFacingMode: {
      type: String,
      enum: ["user", "environment"],
      default: "user",
    },
    resolution: { type: Number, default: 720 },
    maxFullResolutionParticipants: { type: Number, default: 2 },
    constraints: VideoConstraintsSchema,
    disableSimulcast: { type: Boolean, default: false },
    startVideoMuted: { type: Number, min: 1 },
    startWithVideoMuted: Boolean,
    videoQuality: VideoQualitySchema,

    // ===== Desktop Sharing =====
    desktopSharingFrameRate: {
      min: { type: Number, default: 5 },
      max: { type: Number, default: 5 },
    },
    desktopSharingSources: [{ type: String, enum: ["screen", "window"] }],
    _desktopSharingSourceDevice: String,

    // ===== Recording Configuration =====
    dropbox: DropboxSchema,
    recordings: RecordingsSchema,
    localRecording: LocalRecordingSchema,
    fileRecordingsEnabled: { type: Boolean, default: false },

    // ===== Transcription =====
    transcription: TranscriptionSchema,

    // ===== Connection & Performance =====
    channelLastN: { type: Number, default: -1 },
    startLastN: Number,
    disableRtx: { type: Boolean, default: false },
    disableBeforeUnloadHandlers: Boolean,
    enableTcc: { type: Boolean, default: true },
    enableRemb: { type: Boolean, default: true },
    enableForcedReload: Boolean,
    useTurnUdp: { type: Boolean, default: false },
    enableEncodedTransformSupport: { type: Boolean, default: false },
    enableIceRestart: { type: Boolean, default: false },
    webrtcIceUdpDisable: { type: Boolean, default: false },
    webrtcIceTcpDisable: { type: Boolean, default: false },

    // ===== UI Configuration =====
    requireDisplayName: Boolean,
    lobby: LobbySchema,
    securityUi: SecurityUISchema,
    disableShortcuts: { type: Boolean, default: false },
    disableInitialGUM: { type: Boolean, default: false },
    enableClosePage: { type: Boolean, default: false },
    disable1On1Mode: Boolean,
    defaultLocalDisplayName: { type: String, default: "me" },
    defaultRemoteDisplayName: { type: String, default: "Fellow Jitster" },
    hideDisplayName: { type: Boolean, default: false },
    hideDominantSpeakerBadge: { type: Boolean, default: false },
    defaultLanguage: { type: String, default: "en" },
    disableProfile: { type: Boolean, default: false },
    hideEmailInSettings: { type: Boolean, default: false },
    roomPasswordNumberOfDigits: { type: Number, max: 50 },
    noticeMessage: String,

    // ===== Toolbar Configuration =====
    toolbarButtons: [String],
    buttonsWithNotifyClick: [Schema.Types.Mixed],
    participantMenuButtonsWithNotifyClick: [Schema.Types.Mixed],
    customParticipantMenuButtons: [CustomButtonSchema],
    customToolbarButtons: [CustomButtonSchema],

    // ===== Analytics & Stats =====
    gatherStats: { type: Boolean, default: false },
    pcStatsInterval: { type: Number, default: 10000 },
    enableDisplayNameInStats: { type: Boolean, default: false },
    enableEmailInStats: { type: Boolean, default: false },
    faceLandmarks: FaceLandmarksSchema,
    feedbackPercentage: { type: Number, default: 100, min: 0, max: 100 },

    // ===== P2P Configuration =====
    p2p: P2PSchema,

    // ===== API Configuration =====
    apiLogLevels: [
      {
        type: String,
        enum: ["warn", "log", "error", "info", "debug"],
      },
    ],
    mouseMoveCallbackInterval: { type: Number, default: 1000 },
    useHostPageLocalStorage: Boolean,

    // ===== Sound Configuration =====
    disabledSounds: [
      {
        type: String,
        enum: [
          "ASKED_TO_UNMUTE_SOUND",
          "E2EE_OFF_SOUND",
          "E2EE_ON_SOUND",
          "INCOMING_MSG_SOUND",
          "KNOCKING_PARTICIPANT_SOUND",
          "LIVE_STREAMING_OFF_SOUND",
          "LIVE_STREAMING_ON_SOUND",
          "NO_AUDIO_SIGNAL_SOUND",
          "NOISY_AUDIO_INPUT_SOUND",
          "OUTGOING_CALL_EXPIRED_SOUND",
          "OUTGOING_CALL_REJECTED_SOUND",
          "OUTGOING_CALL_RINGING_SOUND",
          "OUTGOING_CALL_START_SOUND",
          "PARTICIPANT_JOINED_SOUND",
          "PARTICIPANT_LEFT_SOUND",
          "RAISE_HAND_SOUND",
          "REACTION_SOUND",
          "RECORDING_OFF_SOUND",
          "RECORDING_ON_SOUND",
          "TALK_WHILE_MUTED_SOUND",
        ],
      },
    ],

    // ===== Security =====
    e2ee: E2EESchema,
    disableThirdPartyRequests: { type: Boolean, default: false },

    // ===== Participants Pane =====
    participantsPane: ParticipantsPaneSchema,

    // ===== Breakout Rooms =====
    breakoutRooms: BreakoutRoomsSchema,

    // ===== Filmstrip =====
    disableFilmstripAutohiding: { type: Boolean, default: false },
    filmstrip: FilmstripSchema,

    // ===== Integrations =====
    etherpad_base: String,
    openSharedDocumentOnJoin: { type: Boolean, default: false },
    giphy: GiphySchema,

    // ===== CallStats Integration =====
    callStatsID: String,
    callStatsSecret: String,
    callStatsConfigParams: CallStatsConfigParamsSchema,

    // ===== Moderation =====
    disableModeratorIndicator: { type: Boolean, default: false },
    disableReactions: { type: Boolean, default: false },
    disablePolls: { type: Boolean, default: false },
    hideRecordingLabel: { type: Boolean, default: false },

    // ===== Notifications =====
    notifications: [String],
    disabledNotifications: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// =====================================================================
// INDEXES
// =====================================================================
JitsiConfigSchema.index({ createdBy: 1, isActive: 1 });
JitsiConfigSchema.index({ name: 1, createdBy: 1 }, { unique: true });
JitsiConfigSchema.index({ "hosts.domain": 1 });

// =====================================================================
// VIRTUAL PROPERTIES
// =====================================================================

// Virtual for getting config as Jitsi-compatible object
JitsiConfigSchema.virtual("jitsiConfig").get(function () {
  const config: Record<string, any> = this.toObject();

  // Remove MongoDB specific fields
  delete config._id;
  delete config.__v;
  delete config.createdAt;
  delete config.updatedAt;
  delete config.createdBy;
  delete config.name;
  delete config.description;
  delete config.isActive;

  // Remove undefined/null values for cleaner config
  Object.keys(config).forEach((key) => {
    if (config[key] === undefined || config[key] === null) {
      delete config[key];
    }
  });

  return config;
});

// =====================================================================
// MIDDLEWARE
// =====================================================================

// Pre-save validation
JitsiConfigSchema.pre("save", function (next) {
  // Validate domain format if hosts.domain is provided
  if (this.hosts && this.hosts.domain && !this.hosts.domain.includes(".")) {
    return next(new Error("Invalid domain format in hosts.domain"));
  }

  // Ensure only one active config per user
  if (this.isActive && this.isNew) {
    (this.constructor as Model<typeof this>)
      .updateMany(
        { createdBy: this.createdBy, _id: { $ne: this._id } },
        { isActive: false }
      )
      .exec();
  }

  next();
});

// =====================================================================
// STATIC METHODS
// =====================================================================

// Get active config for a user
JitsiConfigSchema.statics.getActiveConfig = function (userId) {
  return this.findOne({ createdBy: userId, isActive: true });
};

// Create default config with sensible defaults
JitsiConfigSchema.statics.createDefaultConfig = function (
  userId,
  configName = "Default Config"
) {
  return this.create({
    name: configName,
    description: "Default Jitsi Meet configuration with optimized settings",
    createdBy: userId,

    // Connection defaults
    hosts: {
      domain: "live.edusathi.net",
    },

    // Audio defaults
    enableNoAudioDetection: true,
    enableNoisyMicDetection: true,
    audioLevelsInterval: 200,
    audioQuality: {
      stereo: false,
      enableOpusDtx: false,
    },

    // Video defaults
    resolution: 720,
    constraints: {
      video: {
        height: { ideal: 720, max: 720, min: 240 },
        width: { ideal: 1280, max: 1280, min: 320 },
      },
    },

    // P2P defaults
    p2p: {
      enabled: true,
      iceTransportPolicy: "all",
      backToP2PDelay: 5,
      stunServers: [{ urls: "stun:meet-jit-si-turnrelay.jitsi.net:443" }],
    },

    // UI defaults
    lobby: {
      autoKnock: false,
      enableChat: true,
      showHangUp: true,
    },

    // Security defaults
    e2ee: {
      labels: {
        label: "End-to-End Encryption",
      },
    },

    // Performance defaults
    channelLastN: -1,
    gatherStats: false,
    pcStatsInterval: 10000,
  });
};

// =====================================================================
// INSTANCE METHODS
// =====================================================================

// Clone configuration
JitsiConfigSchema.methods.cloneConfig = function (
  newName: string,
  userId: string
) {
  const configData = this.toObject();
  delete configData._id;
  delete configData.createdAt;
  delete configData.updatedAt;

  configData.name = newName;
  configData.createdBy = userId || this.createdBy;
  configData.isActive = false;

  return new JitsiConfig(configData);
};

// Activate this config (deactivates others)
JitsiConfigSchema.methods.activate = async function () {
  await JitsiConfig.updateMany(
    { createdBy: this.createdBy, _id: { $ne: this._id } },
    { isActive: false }
  );

  this.isActive = true;
  return this.save();
};

// Export config to external format
JitsiConfigSchema.methods.exportConfig = function () {
  return {
    name: this.name,
    description: this.description,
    config: this.jitsiConfig,
    exportedAt: new Date().toISOString(),
    version: "1.0",
  };
};

export const JitsiConfig =
  models.JitsiConfig || model("JitsiConfig", JitsiConfigSchema);
