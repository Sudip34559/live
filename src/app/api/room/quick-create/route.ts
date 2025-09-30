import { connectDB } from "@/lib/database";
import { Room } from "@/models/Room";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";

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

    const { title, description, roomType, createdBy } = await request.json();

    // Validation
    if (!title || !roomType || !createdBy) {
      return NextResponse.json(
        {
          error: "Title, roomType are required",
        },
        { status: 400 }
      );
    }

    // Check authorization
    const authResult = await isAuthorizedToCreateRoom(createdBy);
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          error: authResult.error,
          code: "UNAUTHORIZED_ROOM_CREATION",
        },
        { status: 403 }
      );
    }

    const now = new Date();

    const startHour = now.getHours();
    const startMinute = now.getMinutes();

    // Format start time (HH:MM)
    const startTime = `${String(startHour).padStart(2, "0")}:${String(
      startMinute
    ).padStart(2, "0")}`;

    // Auto set end = start + 4 hours
    const eDate = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    const endHour = eDate.getHours();
    const endMinute = eDate.getMinutes();

    const endTime = `${String(endHour).padStart(2, "0")}:${String(
      endMinute
    ).padStart(2, "0")}`;

    // Format date (YYYY-MM-DD)
    const date = now.toISOString().split("T")[0];
    const endDate = eDate.toISOString().split("T")[0];
    // Generate unique room name for Jitsi
    const roomName = generateRoomName(title);

    // Create room data
    const roomData: any = {
      title,
      description,
      roomType,
      createdBy,
      roomName,
      date,
      startTime,
      endTime,
      endDate,
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
