import { NextRequest, NextResponse } from "next/server";
import { Attendance } from "@/models/Attendance";
import { Room } from "@/models/Room";
import { connectDB } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    await connectDB();

    const { roomId } = params;
    const { searchParams } = new URL(request.url);
    const active = searchParams.get("active");
    const includeStats = searchParams.get("stats") === "true";

    // Verify room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Build query
    const query: any = { room: roomId };
    if (active === "true") query.leaveTime = { $exists: false };

    const attendances = await Attendance.find(query)
      .populate("user", "name email")
      .sort({ joinTime: -1 });

    const response: any = {
      roomId,
      roomTitle: room.title,
      attendances,
    };

    if (includeStats) {
      // Calculate attendance statistics
      const stats = await calculateRoomAttendanceStats(roomId);
      response.statistics = stats;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching room attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    await connectDB();

    const { roomId } = params;
    const { userId, role } = await request.json();

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 }
      );
    }

    // Create attendance record for specific room
    const attendance = await Attendance.create({
      room: roomId,
      user: userId,
      role,
      joinTime: new Date(),
    });

    await attendance.populate([
      { path: "room", select: "title roomType" },
      { path: "user", select: "name email" },
    ]);

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error("Error creating room attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate attendance statistics
async function calculateRoomAttendanceStats(roomId: string) {
  const stats = await Attendance.aggregate([
    { $match: { room: roomId } },
    {
      $group: {
        _id: null,
        totalAttendees: { $sum: 1 },
        uniqueAttendees: { $addToSet: "$user" },
        roleBreakdown: {
          $push: "$role",
        },
        averageDuration: {
          $avg: {
            $cond: [
              { $ne: ["$leaveTime", null] },
              { $subtract: ["$leaveTime", "$joinTime"] },
              null,
            ],
          },
        },
      },
    },
    {
      $project: {
        totalAttendees: 1,
        uniqueAttendeeCount: { $size: "$uniqueAttendees" },
        roleBreakdown: 1,
        averageDurationMinutes: { $divide: ["$averageDuration", 1000 * 60] },
      },
    },
  ]);

  const roleStats = await Attendance.aggregate([
    { $match: { room: roomId } },
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  return {
    ...stats[0],
    roleDistribution: roleStats.reduce((acc, role) => {
      acc[role._id] = role.count;
      return acc;
    }, {}),
  };
}
