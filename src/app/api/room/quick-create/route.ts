import { connectDB } from "@/lib/database";
import { Room } from "@/models/Room";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/providers";
import { DateTime } from "luxon";
// Generate unique room name for Jitsi
function generateRoomName(title: string): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${cleanTitle}_${timestamp}_${randomId}`;
}

// Helper function to check if user is authorized to create rooms
async function isAuthorizedToCreateRoom(userId: string): Promise<{
  authorized: boolean;
  error?: string;
}> {
  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return { authorized: false, error: "User not found" };
    }

    // Check if user is verified
    if (!user.isVerified) {
      return {
        authorized: false,
        error: "User account must be verified to create rooms",
      };
    }
    return {
      authorized: true,
    };
  } catch (error) {
    console.error("Error checking user authorization:", error);
    return {
      authorized: false,
      error: "Error verifying user permissions",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      title,
      roomType,
      timeZone = "Asia/Calcutta",
    } = await request.json();
    // Validation
    if (!title || !roomType) {
      return NextResponse.json(
        {
          error: "Title, roomType are required",
        },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    // Check authorization
    const authResult = await isAuthorizedToCreateRoom(session?.user._id || "");
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: authResult.error,
          code: "UNAUTHORIZED_ROOM_CREATION",
        },
        { status: 403 }
      );
    }

    // Current time in that timezone
    const now = DateTime.now().setZone(timeZone);

    // Format date (YYYY-MM-DD)
    const date = now.toISODate(); // "2025-10-03"

    // Start time in UTC
    const startTime = now.toUTC().toISO(); // e.g., "2025-10-03T03:00:00.000Z"

    // End time in UTC (start + 4 hours)
    const endTime = now.plus({ hours: 4 }).toUTC().toISO();

    // Generate unique room name for Jitsi
    const roomName = generateRoomName(title);

    // Create room data
    const roomData: any = {
      title,
      roomType,
      createdBy: session?.user._id,
      roomName,
      date,
      startTime,
      endTime,
      timeZone,
      status: "live",
      isPublic: true,
      maxParticipants: 20,
    };

    // Create room
    const newRoom = await Room.create(roomData);

    return NextResponse.json(
      {
        success: true,
        room: newRoom,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
