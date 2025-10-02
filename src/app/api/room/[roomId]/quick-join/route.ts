// api/room/[roomId]/route.js
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Room } from "@/models/Room";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/providers";
import { ParticipantManager } from "@/helpers/participantManager";

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
    const room = await Room.findById(roomId);
    const roomConf = ParticipantManager.getConfig(roomId);
    if (!(await roomConf).expiryTime) {
      ParticipantManager.setConfig(roomId, {
        maxParticipants: room.maxParticipants,
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
          maxParticipants: 20,
          blocked: true,
        },
        { status: 429 }
      );
    }

    // ✅ ALLOWED: Continue with room join
    const session = await getServerSession(authOptions);

    if (!room) {
      // Rollback participant count if room not found
      await ParticipantManager.leaveRoom(roomId);
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Build JWT payload based on user session
    let payload;

    if (session && room.createdBy === session.user._id) {
      // Room creator gets moderator access
      payload = {
        aud: "jitsi",
        iss: process.env.JITSI_APP_ID,
        sub: process.env.JITSI_DOMAIN,
        room: room.roomName,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 4,
        context: {
          user: {
            name: session.user.name,
            email: session.user.email,
            moderator: true,
          },
        },
      };
    } else {
      // Regular participant
      payload = {
        aud: "jitsi",
        iss: process.env.JITSI_APP_ID,
        sub: process.env.JITSI_DOMAIN,
        room: room.roomName,
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        context: {
          user: {
            name: session?.user?.name || name,
            email: session?.user?.email || `guest_${Date.now()}@guest.com`,
            moderator: false,
          },
        },
      };
    }

    const token = jwt.sign(payload, process.env.JITSI_APP_SECRET as string, {
      algorithm: "HS256",
    });

    const meetingLink = `https://${process.env.JITSI_DOMAIN}/${room.roomName}?jwt=${token}`;

    return NextResponse.json({
      meetingLink,
      jwt: token,
      participantCount: joinResult.count,
      remainingSlots: joinResult.remaining,
      maxParticipants: 20,
      blocked: false,
    });
  } catch (err) {
    console.error("JWT generation failed:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
