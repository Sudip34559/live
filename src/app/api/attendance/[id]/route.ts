import { NextRequest, NextResponse } from "next/server";
import { Attendance } from "@/models/Attendance";
import { connectDB } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const attendance = await Attendance.findById(id)
      .populate("room", "title roomType date startTime endTime")
      .populate("user", "name email");

    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    // Calculate duration if both join and leave times exist
    let duration = null;
    if (attendance.leaveTime) {
      const durationMs =
        attendance.leaveTime.getTime() - attendance.joinTime.getTime();
      duration = {
        milliseconds: durationMs,
        minutes: Math.floor(durationMs / (1000 * 60)),
        hours: Math.floor(durationMs / (1000 * 60 * 60)),
        formatted: formatDuration(durationMs),
      };
    }

    return NextResponse.json({
      ...attendance.toObject(),
      duration,
    });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const { leaveTime, role } = await request.json();

    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (leaveTime) {
      const leaveDate = new Date(leaveTime);
      if (leaveDate <= attendance.joinTime) {
        return NextResponse.json(
          { error: "Leave time must be after join time" },
          { status: 400 }
        );
      }
      updateData.leaveTime = leaveDate;
    }

    if (role && ["host", "cohost", "member", "guest"].includes(role)) {
      updateData.role = role;
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "room", select: "title roomType" },
      { path: "user", select: "name email" },
    ]);

    // Calculate duration if both times exist
    let duration = null;
    if (updatedAttendance?.leaveTime) {
      const durationMs =
        updatedAttendance.leaveTime.getTime() -
        updatedAttendance.joinTime.getTime();
      duration = {
        milliseconds: durationMs,
        minutes: Math.floor(durationMs / (1000 * 60)),
        formatted: formatDuration(durationMs),
      };
    }

    return NextResponse.json({
      ...updatedAttendance?.toObject(),
      duration,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const deletedAttendance = await Attendance.findByIdAndDelete(id);

    if (!deletedAttendance) {
      return NextResponse.json(
        { error: "Attendance record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to format duration
function formatDuration(durationMs: number): string {
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}
