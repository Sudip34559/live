import { NextRequest, NextResponse } from "next/server";
import { Attendance } from "@/models/Attendance";
import { User } from "@/models/User";
import { connectDB } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();

    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const includeStats = searchParams.get("stats") === "true";

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build query
    const query: any = { user: userId };
    if (startDate || endDate) {
      query.joinTime = {};
      if (startDate) query.joinTime.$gte = new Date(startDate);
      if (endDate) query.joinTime.$lte = new Date(endDate);
    }

    const attendances = await Attendance.find(query)
      .populate("room", "title roomType date startTime endTime")
      .sort({ joinTime: -1 });

    const response: any = {
      userId,
      userName: user.name,
      attendances,
    };

    if (includeStats) {
      // Calculate user attendance statistics
      const stats = await calculateUserAttendanceStats(userId, query);
      response.statistics = stats;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to calculate user attendance statistics
async function calculateUserAttendanceStats(userId: string, baseQuery: any) {
  const stats = await Attendance.aggregate([
    { $match: { ...baseQuery, user: userId } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: {
          $sum: {
            $cond: [
              { $ne: ["$leaveTime", null] },
              { $subtract: ["$leaveTime", "$joinTime"] },
              0,
            ],
          },
        },
        roleBreakdown: { $push: "$role" },
        uniqueRooms: { $addToSet: "$room" },
      },
    },
  ]);

  const roleStats = await Attendance.aggregate([
    { $match: { ...baseQuery, user: userId } },
    { $group: { _id: "$role", count: { $sum: 1 } } },
  ]);

  return {
    totalSessions: stats[0]?.totalSessions || 0,
    totalDurationMinutes: Math.floor(
      (stats[0]?.totalDuration || 0) / (1000 * 60)
    ),
    uniqueRoomsCount: stats[0]?.uniqueRooms?.length || 0,
    roleDistribution: roleStats.reduce((acc, role) => {
      acc[role._id] = role.count;
      return acc;
    }, {}),
  };
}
