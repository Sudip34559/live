// app/api/room/[roomId]/quick-join/route.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { Room } from "@/models/Room";
import { ParticipantManager } from "@/helpers/participantManager";
import { authOptions } from "@/app/api/auth/[...nextauth]/providers";

export async function GET(
  req: NextRequest,
  { params }: { params: { roomId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name") || "Guest";
    const roomId = params.roomId;

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    // Fetch room
    const room = await Room.findById(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Check capacity
    const roomConf = await ParticipantManager.getConfig(roomId);
    if (!roomConf.expiryTime) {
      await ParticipantManager.setConfig(roomId, {
        maxParticipants: room.maxParticipants || 20,
        expiryTime: 60 * 60 * 4,
      });
    }

    const joinResult = await ParticipantManager.joinRoom(roomId);
    if (!joinResult.success) {
      return NextResponse.json(
        {
          error: "Room is full",
          message: joinResult.message,
          currentCount: joinResult.count,
          maxParticipants: room.maxParticipants || 20,
          blocked: true,
        },
        { status: 429 }
      );
    }

    // Check moderator
    const session = await getServerSession(authOptions);
    const isModerator =
      session && room.createdBy.toString() === session.user._id;

    // 🔥 CRITICAL FIX: Use room.roomName, not room._id
    const payload = {
      aud: process.env.JITSI_APP_ID,
      iss: process.env.JITSI_APP_ID,
      sub: process.env.JITSI_DOMAIN,
      room: room.roomName, // ✅ Must match the roomName prop in JitsiMeeting
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
      context: {
        user: {
          id: session?.user?._id || `guest_${Date.now()}`,
          name: session?.user?.name || name,
          email: session?.user?.email || `guest@guest.local`,
          moderator: isModerator,
          lobby_bypass: isModerator,
        },
      },
    };

    const token = jwt.sign(payload, process.env.JITSI_APP_SECRET as string, {
      algorithm: "HS256",
    });

    console.log("✅ Generated JWT for room:", room.roomName);
    console.log("👤 Moderator:", isModerator);

    return NextResponse.json({
      isModerator,
      jwt: token,
      roomName: room.roomName, // ✅ Return the actual room name
      participantCount: joinResult.count,
      remainingSlots: joinResult.remaining,
      maxParticipants: room.maxParticipants || 20,
      blocked: false,
    });
  } catch (err) {
    console.error("Room join API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
