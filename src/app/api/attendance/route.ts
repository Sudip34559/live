import { NextRequest, NextResponse } from "next/server";
import { Attendance } from "@/models/Attendance";
import { Room } from "@/models/Room";
import { User } from "@/models/User";
import { connectDB } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { room, user, role, joinTime } = await request.json();

    if (!room || !user || !role) {
      return NextResponse.json(
        { error: "Room, user, and role are required" },
        { status: 400 }
      );
    }

    // Verify room exists
    const roomExists = await Room.findById(room);
    if (!roomExists) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Verify user exists
    const userExists = await User.findById(user);
    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has an active attendance record (joined but not left)
    const activeAttendance = await Attendance.findOne({
      room,
      user,
      leaveTime: { $exists: false },
    });

    if (activeAttendance) {
      return NextResponse.json(
        { error: "User already has an active attendance record in this room" },
        { status: 409 }
      );
    }

    // Create attendance record
    const newAttendance = await Attendance.create({
      room,
      user,
      role,
      joinTime: joinTime ? new Date(joinTime) : new Date(),
    });

    // Populate user and room info
    await newAttendance.populate([
      { path: "room", select: "title roomType date startTime endTime" },
      { path: "user", select: "name email" },
    ]);

    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error) {
    console.error("Error creating attendance:", error);
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
    const room = searchParams.get("room");
    const user = searchParams.get("user");
    const role = searchParams.get("role");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const active = searchParams.get("active"); // Get only active attendances (no leave time)
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build query
    const query: any = {};
    if (room) query.room = room;
    if (user) query.user = user;
    if (role) query.role = role;
    if (active === "true") query.leaveTime = { $exists: false };

    // Date range filter
    if (startDate || endDate) {
      query.joinTime = {};
      if (startDate) query.joinTime.$gte = new Date(startDate);
      if (endDate) query.joinTime.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [attendances, total] = await Promise.all([
      Attendance.find(query)
        .populate("room", "title roomType date startTime endTime status")
        .populate("user", "name email")
        .sort({ joinTime: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(query),
    ]);

    return NextResponse.json({
      attendances,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching attendances:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
