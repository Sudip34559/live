import { NextRequest, NextResponse } from "next/server";
import { Room } from "@/models/Room";
import { RoomParticipant } from "@/models/RoomParticipant";
import { connectDB } from "@/lib/database";

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    await connectDB();

    const { roomId } = params;

    // Update room status to live
    const room = await Room.findByIdAndUpdate(
      roomId,
      { status: "live" },
      { new: true }
    );

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Auto-join all waiting participants (except blocked ones)
    const waitingParticipants = await RoomParticipant.updateMany(
      {
        room: roomId,
        status: "waiting",
        role: { $in: ["cohost", "member", "guest"] }, // Don't auto-join hosts as they should already be joined
      },
      {
        status: "joined",
        joinedAt: new Date(),
      }
    );

    // Get updated participant counts
    const participantCounts = await RoomParticipant.aggregate([
      { $match: { room: roomId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return NextResponse.json({
      success: true,
      room,
      participantsAutoJoined: waitingParticipants.modifiedCount,
      participantCounts: participantCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      message: `Room is now live. ${waitingParticipants.modifiedCount} waiting participants automatically joined.`,
    });
  } catch (error) {
    console.error("Error making room live:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
