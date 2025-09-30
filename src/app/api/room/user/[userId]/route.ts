import { NextRequest, NextResponse } from "next/server";
import { Room } from "@/models/Room";
import { connectDB } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await connectDB();

    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    // Build query
    const query: any = { createdBy: userId };
    if (status) query.status = status;

    const rooms = await Room.find(query)
      .populate("createdBy", "name email")
      .sort({ date: 1, startTime: 1 });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("Error fetching user rooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
