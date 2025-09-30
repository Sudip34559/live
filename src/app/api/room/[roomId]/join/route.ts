import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Room } from "@/models/Room";
import { User } from "@/models/User";
import { Host } from "@/models/Host";
import { RoomParticipant } from "@/models/RoomParticipant";
import { connectDB } from "@/lib/database";

// JWT configuration - should be in environment variables
const JITSI_APP_ID = process.env.JITSI_APP_ID || "your_app_id";
const JITSI_APP_SECRET = process.env.JITSI_APP_SECRET || "your_app_secret";
const JITSI_DOMAIN = process.env.JITSI_DOMAIN || "meet.yourdomain.com";

interface JoinRoomRequest {
  userId: string;
  userName?: string;
  userEmail?: string;
  requestedRole?: "cohost" | "member" | "guest";
}

// Function to calculate duration between start and end times
function calculateDuration(
  startTime: string,
  endTime: string
): {
  hours: number;
  minutes: number;
  totalMinutes: number;
  formattedDuration: string;
} {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const today = new Date();
  const startDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    startHour,
    startMinute
  );
  const endDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    endHour,
    endMinute
  );

  if (endDate < startDate) {
    endDate.setDate(endDate.getDate() + 1);
  }

  const timeDifferenceMS = endDate.getTime() - startDate.getTime();
  const totalMinutes = Math.floor(timeDifferenceMS / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return {
    hours,
    minutes,
    totalMinutes,
    formattedDuration: `${hours}h ${minutes}m`,
  };
}

// Determine participant role and permissions
async function determineParticipantRole(
  roomId: string,
  userId: string,
  requestedRole?: string
) {
  const room = await Room.findById(roomId).populate("createdBy", "globalRole");
  const user = await User.findById(userId);

  if (!room || !user) {
    throw new Error("Room or user not found");
  }

  // Room creator is always host
  if (room.createdBy._id.toString() === userId) {
    return {
      role: "host" as const,
      isModerator: true,
      canJoinDirectly: true,
      reason: "Room creator",
    };
  }

  // Admin users are cohosts with moderator privileges
  if (user.globalRole === "admin") {
    return {
      role: "cohost" as const,
      isModerator: true,
      canJoinDirectly: true,
      reason: "System administrator",
    };
  }

  // Check if user has host account
  const hostAccount = await Host.findOne({ userId, isActive: true });
  if (hostAccount) {
    return {
      role: "cohost" as const,
      isModerator: true,
      canJoinDirectly: room.status === "live",
      reason: "Host account holder",
    };
  }

  // Regular users/clients
  const role =
    requestedRole && ["cohost", "member", "guest"].includes(requestedRole)
      ? (requestedRole as "cohost" | "member" | "guest")
      : ("member" as const);

  return {
    role,
    isModerator: false,
    canJoinDirectly: room.status === "live",
    reason: "Regular participant",
  };
}

function generateJitsiJWT(params: {
  roomName: string;
  userId: string;
  userName: string;
  userEmail?: string;
  isModerator: boolean;
  role: string;
  avatarUrl?: string;
  durationMinutes: number;
}) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + params.durationMinutes * 60 + 30 * 60; // Duration + 30 min buffer

  const payload = {
    context: {
      user: {
        id: params.userId,
        name: params.userName,
        email: params.userEmail || "",
        avatar: params.avatarUrl || "",
        moderator: params.isModerator,
      },
      features: {
        livestreaming: params.isModerator,
        recording: params.isModerator,
        transcription: params.isModerator,
        "outbound-call": params.isModerator,
        "screen-sharing": params.isModerator,
        "participants-pane": true,
        
        chat: true,
      },
    },
    aud: JITSI_APP_ID,
    iss: JITSI_APP_ID,
    sub: JITSI_DOMAIN,
    room: params.roomName,
    exp: exp,
    nbf: now,
    iat: now,
    // Additional custom claims
    moderator: params.isModerator,
    affiliation: params.isModerator ? "owner" : "member",
  };

  return jwt.sign(payload, JITSI_APP_SECRET, { algorithm: "HS256" });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    await connectDB();

    const { roomId } = await params;
    const { userId, userName, userEmail, requestedRole }: JoinRoomRequest =
      await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Find the room
    const room = await Room.findById(roomId).populate(
      "createdBy",
      "name email globalRole"
    );

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check if room is available for joining
    if (room.status === "cancelled") {
      return NextResponse.json(
        { error: "Room has been cancelled" },
        { status: 400 }
      );
    }

    if (room.status === "completed") {
      return NextResponse.json({ error: "Room has ended" }, { status: 400 });
    }

    // Find the user trying to join
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        {
          error:
            "User account is not verified. Please verify your account to join meetings.",
          code: "USER_NOT_VERIFIED",
        },
        { status: 403 }
      );
    }

    // Determine participant role and permissions
    const participantInfo = await determineParticipantRole(
      roomId,
      userId,
      requestedRole
    );

    console.log(participantInfo);

    // Calculate meeting duration
    const duration = calculateDuration(room.startTime, room.endTime);

    // Check or create participant record
    let participant = await RoomParticipant.findOne({
      room: roomId,
      user: userId,
    });

    let participantStatus = "";
    let isNewParticipant = false;

    if (!participant) {
      // Create new participant
      const newParticipantStatus = participantInfo.canJoinDirectly
        ? "joined"
        : "waiting";

      participant = await RoomParticipant.create({
        room: roomId,
        user: userId,
        role: participantInfo.role,
        status: newParticipantStatus,
        joinedAt: newParticipantStatus === "joined" ? new Date() : undefined,
      });

      isNewParticipant = true;
      participantStatus = `Added as ${participantInfo.role} with ${newParticipantStatus} status`;
    } else {
      // Update existing participant
      if (participant.status === "blocked") {
        return NextResponse.json(
          { error: "You are blocked from this room" },
          { status: 403 }
        );
      }

      // Auto-join if room is live and participant was waiting
      if (room.status === "live" && participant.status === "waiting") {
        participant.status = "joined";
        participant.joinedAt = new Date();
        await participant.save();
        participantStatus = "Auto-joined as room is now live";
      } else if (participant.status === "joined") {
        participantStatus = "Already joined";
      } else {
        participantStatus = `Current status: ${participant.status}`;
      }
    }

    // If participant can't join directly, return waiting response
    if (!participantInfo.canJoinDirectly && participant.status !== "joined") {
      return NextResponse.json({
        success: false,
        canJoin: false,
        participant: {
          id: participant._id,
          role: participant.role,
          status: participant.status,
          reason: participantInfo.reason,
        },
        room: {
          id: room._id,
          title: room.title,
          status: room.status,
          startTime: room.startTime,
          endTime: room.endTime,
          date: room.date,
          duration: duration,
        },
        message: `You are in ${participant.status} status. ${
          room.status === "scheduled"
            ? "Room will start at " + room.startTime
            : "Wait for host approval."
        }`,
        waitingReason:
          room.status === "scheduled"
            ? "ROOM_NOT_STARTED"
            : "WAITING_FOR_APPROVAL",
      });
    }

    // Update room status if moderator joins scheduled room
    if (participantInfo.isModerator && room.status === "scheduled") {
      await Room.findByIdAndUpdate(roomId, { status: "live" });

      // Auto-join waiting participants
      await RoomParticipant.updateMany(
        {
          room: roomId,
          status: "waiting",
          role: { $in: ["cohost", "member", "guest"] },
        },
        {
          status: "joined",
          joinedAt: new Date(),
        }
      );
    }

    // Generate JWT token for Jitsi
    const jwtToken = generateJitsiJWT({
      roomName: room.roomName,
      userId: userId,
      userName: userName || user.name,
      userEmail: userEmail || user.email,
      isModerator: participantInfo.isModerator,
      role: participantInfo.role,
      avatarUrl: undefined,
      durationMinutes: duration.totalMinutes,
    });

    // Prepare meeting URL
    const meetingUrl = `https://${JITSI_DOMAIN}/${room.roomName}?jwt=${jwtToken}`;

    // Get participant counts
    const participantCounts = await RoomParticipant.aggregate([
      { $match: { room: room._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const counts = participantCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      canJoin: true,
      room: {
        id: room._id,
        title: room.title,
        description: room.description,
        roomName: room.roomName,
        roomType: room.roomType,
        status: room.status,
        startTime: room.startTime,
        endTime: room.endTime,
        date: room.date,
        duration: duration,
        creator: room.createdBy,
        participantCounts: counts,
      },
      participant: {
        id: participant._id,
        role: participant.role,
        status: participant.status,
        isModerator: participantInfo.isModerator,
        isNewParticipant,
        joinedAt: participant.joinedAt,
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
      jitsi: {
        token: jwtToken,
        meetingUrl: meetingUrl,
        domain: JITSI_DOMAIN,
        roomName: room.roomName,
        config: {
          startWithAudioMuted: !participantInfo.isModerator,
          startWithVideoMuted: !participantInfo.isModerator,
          prejoinPageEnabled: false,
          disableModeratorIndicator: false,
          enableWelcomePage: false,
          enableClosePage: false,
          toolbarButtons: [
            "microphone",
            "camera",
            "closedcaptions",
            "desktop",
            "embedmeeting",
            "fullscreen",
            "fodeviceselection",
            "hangup",
            "profile",
            "chat",
            ...(participantInfo.isModerator
              ? [
                  "recording",
                  "livestreaming",
                  "mute-everyone",
                  "mute-video-everyone",
                  "security",
                ]
              : []),
            "etherpad",
            "sharedvideo",
            "settings",
            "raisehand",
            "videoquality",
            "filmstrip",
            "invite",
            "feedback",
            "stats",
            "shortcuts",
            "tileview",
            "videobackgroundblur",
            "download",
            "help",
          ],
        },
        interfaceConfig: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_ALWAYS_VISIBLE: false,
          DEFAULT_BACKGROUND: "#000000",
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: !participantInfo.isModerator,
        },
      },
      workflow: {
        participantStatus,
        autoJoinedWaiting:
          isNewParticipant &&
          room.status === "live" &&
          !participantInfo.isModerator,
        roomWentLive:
          participantInfo.isModerator && room.status === "scheduled",
      },
    });
  } catch (error: any) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Keep GET method for basic room info without joining
export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    await connectDB();

    const { roomId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const room = await Room.findById(roomId).populate(
      "createdBy",
      "name email"
    );

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const duration = calculateDuration(room.startTime, room.endTime);

    let participantInfo = null;
    if (userId) {
      const participant = await RoomParticipant.findOne({
        room: roomId,
        user: userId,
      }).populate("user", "name email");

      participantInfo = participant;
    }

    return NextResponse.json({
      room: {
        id: room._id,
        title: room.title,
        description: room.description,
        roomType: room.roomType,
        status: room.status,
        startTime: room.startTime,
        endTime: room.endTime,
        duration: duration,
        date: room.date,
        creator: room.createdBy,
      },
      participant: participantInfo,
      canJoin: room.status !== "cancelled" && room.status !== "completed",
    });
  } catch (error) {
    console.error("Error getting room info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
