// app/api/room/[roomId]/leave/route.ts
import { ParticipantManager } from "@/helpers/participantManager";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const roomId = params.roomId;
    if (!roomId) {
      return NextResponse.json({ error: "Room ID required" }, { status: 400 });
    }

    await ParticipantManager.leaveRoom(roomId);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Leave room error:", err);
    return NextResponse.json(
      { error: "Failed to leave room" },
      { status: 500 }
    );
  }
}
