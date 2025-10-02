// api/room/[roomId]/leave/route.js
import { ParticipantManager } from "@/helpers/participantManager";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId;

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    const leaveResult = await ParticipantManager.leaveRoom(roomId);

    return NextResponse.json({
      success: leaveResult.success,
      participantCount: leaveResult.count,
      remainingSlots: leaveResult.remaining,
      maxParticipants: 20,
    });
  } catch (error) {
    console.error("Leave room error:", error);
    return NextResponse.json(
      { error: "Failed to leave room" },
      { status: 500 }
    );
  }
}
