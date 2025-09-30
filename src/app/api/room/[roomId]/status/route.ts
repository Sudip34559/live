import { NextRequest, NextResponse } from "next/server";
import { Room } from "@/models/Room";
import { connectDB } from "@/lib/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    await connectDB();

    const { roomId } = params;
    const { status } = await request.json();

    if (
      !status ||
      !["scheduled", "live", "completed", "cancelled"].includes(status)
    ) {
      return NextResponse.json(
        {
          error:
            "Valid status is required (scheduled, live, completed, cancelled)",
        },
        { status: 400 }
      );
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { status },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!updatedRoom) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: `Room status updated to ${status}`,
      room: updatedRoom,
    });
  } catch (error) {
    console.error("Error updating room status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
