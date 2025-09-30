import { NextRequest, NextResponse } from "next/server";
import { RoomParticipant } from "@/models/RoomParticipant";
import { Room } from "@/models/Room";
import { User } from "@/models/User";
import { Host } from "@/models/Host";
import { Client } from "@/models/Client";
import { connectDB } from "@/lib/database";

// Helper function to determine participant role and status
async function determineParticipantDetails(
  roomId: string,
  userId: string,
  requestedRole?: string
) {
  try {
    // Get room details
    const room = await Room.findById(roomId).populate(
      "createdBy",
      "globalRole"
    );
    if (!room) {
      throw new Error("Room not found");
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is room creator (automatically host)
    if (room.createdBy._id.toString() === userId) {
      return {
        role: "host" as const,
        status: "joined" as const,
        reason: "Room creator gets host role and joins directly",
      };
    }

    // Check if user is admin (automatically cohost)
    if (user.globalRole === "admin") {
      return {
        role: "cohost" as const,
        status: "joined" as const,
        reason: "Admin gets cohost role and joins directly",
      };
    }

    // Check if user is a host (not room creator but has host account)
    const hostAccount = await Host.findOne({ userId, isActive: true });
    if (hostAccount) {
      return {
        role: "cohost" as const,
        status:
          room.status === "live" ? ("joined" as const) : ("waiting" as const),
        reason: "Host account gets cohost role",
      };
    }

    // For regular users/clients - determine role based on request or default to member
    const role =
      requestedRole && ["cohost", "member", "guest"].includes(requestedRole)
        ? (requestedRole as "cohost" | "member" | "guest")
        : ("member" as const);

    // Determine status based on room status
    const status =
      room.status === "live" ? ("joined" as const) : ("waiting" as const);

    return {
      role,
      status,
      reason: `Regular user gets ${role} role and ${status} status`,
    };
  } catch (error) {
    throw error;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    await connectDB();

    const { roomId } = params;
    const { userId, requestedRole } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Check if participant already exists
    const existingParticipant = await RoomParticipant.findOne({
      room: roomId,
      user: userId,
    });

    if (existingParticipant) {
      return NextResponse.json(
        { error: "User is already a participant in this room" },
        { status: 409 }
      );
    }

    // Determine role and status
    const participantDetails = await determineParticipantDetails(
      roomId,
      userId,
      requestedRole
    );

    // Create participant
    const newParticipant = await RoomParticipant.create({
      room: roomId,
      user: userId,
      role: participantDetails.role,
      status: participantDetails.status,
      joinedAt: participantDetails.status === "joined" ? new Date() : undefined,
    });

    // Populate participant details
    await newParticipant.populate([
      { path: "room", select: "title roomType status" },
      { path: "user", select: "name email globalRole" },
    ]);

    return NextResponse.json(
      {
        success: true,
        participant: newParticipant,
        workflow: {
          reason: participantDetails.reason,
          autoJoined: participantDetails.status === "joined",
          requiresApproval: participantDetails.status === "waiting",
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding participant:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    await connectDB();

    const { roomId } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const role = searchParams.get("role");

    // Build query
    const query: any = { room: roomId };
    if (status) query.status = status;
    if (role) query.role = role;

    const participants = await RoomParticipant.find(query)
      .populate("user", "name email globalRole")
      .populate("room", "title status")
      .sort({ createdAt: -1 });

    // Group participants by status for better organization
    const groupedParticipants = {
      joined: participants.filter((p) => p.status === "joined"),
      waiting: participants.filter((p) => p.status === "waiting"),
      approved: participants.filter((p) => p.status === "approved"),
      invited: participants.filter((p) => p.status === "invited"),
      blocked: participants.filter((p) => p.status === "blocked"),
    };

    return NextResponse.json({
      participants,
      grouped: groupedParticipants,
      counts: {
        total: participants.length,
        joined: groupedParticipants.joined.length,
        waiting: groupedParticipants.waiting.length,
        approved: groupedParticipants.approved.length,
        invited: groupedParticipants.invited.length,
        blocked: groupedParticipants.blocked.length,
      },
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
