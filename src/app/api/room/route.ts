import { NextRequest, NextResponse } from "next/server";
import { Room } from "@/models/Room";
import { User } from "@/models/User";
import { Host } from "@/models/Host";
import { connectDB } from "@/lib/database";

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
  userRole: string;
  hostId?: string;
  error?: string;
}> {
  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return { authorized: false, userRole: "", error: "User not found" };
    }

    // Check if user is verified
    if (!user.isVerified) {
      return {
        authorized: false,
        userRole: user.globalRole,
        error: "User account must be verified to create rooms",
      };
    }

    // Check if user is admin (always authorized)
    if (user.globalRole === "admin") {
      return { authorized: true, userRole: "admin" };
    }

    // Check if user is a host
    const host = await Host.findOne({ userId });
    if (!host) {
      return {
        authorized: false,
        userRole: user.globalRole,
        error:
          "Only hosts and admins can create rooms. Please become a host first.",
      };
    }

    // Check if host account is active
    if (!host.isActive) {
      return {
        authorized: false,
        userRole: user.globalRole,
        error: "Host account is inactive. Please contact support.",
      };
    }

    return {
      authorized: true,
      userRole: "host",
      hostId: host?._id?.toString() || "",
    };
  } catch (error) {
    console.error("Error checking user authorization:", error);
    return {
      authorized: false,
      userRole: "",
      error: "Error verifying user permissions",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      title,
      description,
      roomType,
      createdBy,
      date,
      startTime,
      endTime,
      allowedClients,
      isPublic,
      maxParticipants,
    } = await request.json();

    // Validation
    if (!title || !roomType || !createdBy || !date || !startTime || !endTime) {
      return NextResponse.json(
        {
          error:
            "Title, roomType, createdBy, date, startTime, and endTime are required",
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
          requiredRole: ["admin", "host"],
          userRole: authResult.userRole,
        },
        { status: 403 }
      );
    }

    // Validate date is not in the past
    const roomDate = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Reset to start of today

    if (roomDate < now) {
      return NextResponse.json(
        { error: "Cannot create room for a past date" },
        { status: 400 }
      );
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { error: "Time must be in HH:MM format" },
        { status: 400 }
      );
    }

    // Validate start time is before end time
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    if (startMinutes >= endMinutes) {
      return NextResponse.json(
        { error: "Start time must be before end time" },
        { status: 400 }
      );
    }

    // Generate unique room name for Jitsi
    const roomName = generateRoomName(title);

    // Create room data
    const roomData: any = {
      title,
      description,
      roomType,
      createdBy,
      roomName,
      date: new Date(date),
      startTime,
      endTime,
      status: "scheduled",
      isPublic: isPublic || false,
      maxParticipants: maxParticipants || 50,
    };

    // Add hostId if user is a host
    if (authResult.hostId) {
      roomData.hostId = authResult.hostId;
    }

    // Add allowed clients if provided
    if (allowedClients && Array.isArray(allowedClients)) {
      roomData.allowedClients = allowedClients;
    }

    // Create room
    const newRoom = await Room.create(roomData);

    // Populate creator info and host info if available
    const populateOptions = [
      { path: "createdBy", select: "name email globalRole" },
    ];

    if (authResult.hostId) {
      populateOptions.push({ path: "hostId", select: "businessName hostCode" });
    }

    await newRoom.populate(populateOptions);

    return NextResponse.json(
      {
        success: true,
        room: newRoom,
        creatorRole: authResult.userRole,
        message: `Room created successfully by ${authResult.userRole}`,
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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const roomType = searchParams.get("roomType");
    const createdBy = searchParams.get("createdBy");
    const hostId = searchParams.get("hostId");
    const isPublic = searchParams.get("isPublic");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (roomType) query.roomType = roomType;
    if (createdBy) query.createdBy = createdBy;
    if (hostId) query.hostId = hostId;
    if (isPublic !== null) query.isPublic = isPublic === "true";

    // Calculate pagination
    const skip = (page - 1) * limit;

    const [rooms, total] = await Promise.all([
      Room.find(query)
        .populate("createdBy", "name email globalRole")
        .populate("hostId", "businessName hostCode")
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(limit),
      Room.countDocuments(query),
    ]);

    return NextResponse.json({
      rooms,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
