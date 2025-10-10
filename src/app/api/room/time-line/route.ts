import { connectDB } from "@/lib/database";
import { Room } from "@/models/Room";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/providers";
import { endOfMonth, startOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?._id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const today = new Date();

    const createdBy = session.user._id;

    // Get search params and validate
    const startParam = searchParams.get("startTime");
    const endParam = searchParams.get("endTime");

    let startTime: Date;
    let endTime: Date;

    // Only use params if they are valid (not "undefined" string or null)
    if (
      startParam &&
      startParam !== "undefined" &&
      endParam &&
      endParam !== "undefined"
    ) {
      startTime = new Date(startParam);
      endTime = new Date(endParam);

      // Validate dates are valid
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format" },
          { status: 400 }
        );
      }
    } else {
      // Default to current month
      startTime = startOfMonth(today);
      endTime = endOfMonth(today);
      startTime.setHours(0, 0, 0, 0);
      endTime.setHours(23, 59, 59, 999);
    }

    console.log("Query dates:", { startTime, endTime, createdBy });

    const rooms = await Room.find({
      createdBy,
      createdAt: {
        $gte: startTime,
        $lte: endTime,
      },
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      count: rooms.length,
      rooms,
      dateRange: {
        start: startTime.toISOString(),
        end: endTime.toISOString(),
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
