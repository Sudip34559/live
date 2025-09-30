import { NextRequest, NextResponse } from "next/server";
import { Attendance } from "@/models/Attendance";
import { connectDB } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { room, user, leaveTime } = await request.json();

    if (!room || !user) {
      return NextResponse.json(
        { error: "Room and user are required" },
        { status: 400 }
      );
    }

    // Find active attendance record (no leave time)
    const attendance = await Attendance.findOne({
      room,
      user,
      leaveTime: { $exists: false },
    });

    if (!attendance) {
      return NextResponse.json(
        { error: "No active attendance record found" },
        { status: 404 }
      );
    }

    // Update leave time
    const leaveDate = leaveTime ? new Date(leaveTime) : new Date();

    if (leaveDate <= attendance.joinTime) {
      return NextResponse.json(
        { error: "Leave time must be after join time" },
        { status: 400 }
      );
    }

    attendance.leaveTime = leaveDate;
    await attendance.save();

    await attendance.populate([
      { path: "room", select: "title roomType" },
      { path: "user", select: "name email" },
    ]);

    // Calculate session duration
    const durationMs = leaveDate.getTime() - attendance.joinTime.getTime();
    const duration = {
      milliseconds: durationMs,
      minutes: Math.floor(durationMs / (1000 * 60)),
      formatted: formatDuration(durationMs),
    };

    return NextResponse.json({
      success: true,
      attendance,
      duration,
      message: "User marked as left",
    });
  } catch (error) {
    console.error("Error marking leave:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function formatDuration(durationMs: number): string {
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
