import { NextRequest, NextResponse } from "next/server";
import { Room } from "@/models/Room";
import { connectDB } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const roomType = searchParams.get("roomType");
    const status = searchParams.get("status");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");

    // Build search query
    const searchQuery: any = {};

    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ];
    }

    if (roomType) searchQuery.roomType = roomType;
    if (status) searchQuery.status = status;

    if (fromDate && toDate) {
      searchQuery.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    } else if (fromDate) {
      searchQuery.date = { $gte: new Date(fromDate) };
    } else if (toDate) {
      searchQuery.date = { $lte: new Date(toDate) };
    }

    const rooms = await Room.find(searchQuery)
      .populate("createdBy", "name email")
      .sort({ date: 1, startTime: 1 })
      .limit(50);

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Error searching rooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
