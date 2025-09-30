import { NextRequest, NextResponse } from "next/server";
import { RoomParticipant } from "@/models/RoomParticipant";
import { Room } from "@/models/Room";
import { connectDB } from "@/lib/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { roomId: string; participantId: string } }
) {
  try {
    await connectDB();

    const { roomId, participantId } = params;
    const { status, role, action } = await request.json();

    const participant = await RoomParticipant.findById(participantId)
      .populate("room", "status")
      .populate("user", "name email");

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    if (participant.room._id.toString() !== roomId) {
      return NextResponse.json(
        { error: "Participant does not belong to this room" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    let actionMessage = "";

    // Handle specific actions
    if (action) {
      switch (action) {
        case "approve":
          if (participant.status === "waiting") {
            updateData.status = "approved";
            actionMessage = "Participant approved";
          } else {
            return NextResponse.json(
              { error: "Can only approve waiting participants" },
              { status: 400 }
            );
          }
          break;

        case "join":
          if (["approved", "waiting"].includes(participant.status)) {
            updateData.status = "joined";
            updateData.joinedAt = new Date();
            actionMessage = "Participant joined room";
          } else {
            return NextResponse.json(
              { error: "Participant cannot join in current status" },
              { status: 400 }
            );
          }
          break;

        case "leave":
          if (participant.status === "joined") {
            updateData.status = "approved"; // Return to approved status
            updateData.leftAt = new Date();
            actionMessage = "Participant left room";
          } else {
            return NextResponse.json(
              { error: "Only joined participants can leave" },
              { status: 400 }
            );
          }
          break;

        case "block":
          updateData.status = "blocked";
          updateData.leftAt = new Date();
          actionMessage = "Participant blocked";
          break;

        case "promote":
          if (participant.role === "member") {
            updateData.role = "cohost";
            actionMessage = "Participant promoted to cohost";
          } else if (participant.role === "guest") {
            updateData.role = "member";
            actionMessage = "Guest promoted to member";
          } else {
            return NextResponse.json(
              { error: "Cannot promote this participant role" },
              { status: 400 }
            );
          }
          break;

        case "demote":
          if (participant.role === "cohost") {
            updateData.role = "member";
            actionMessage = "Cohost demoted to member";
          } else if (participant.role === "member") {
            updateData.role = "guest";
            actionMessage = "Member demoted to guest";
          } else {
            return NextResponse.json(
              { error: "Cannot demote this participant role" },
              { status: 400 }
            );
          }
          break;

        default:
          return NextResponse.json(
            { error: "Invalid action" },
            { status: 400 }
          );
      }
    } else {
      // Direct status/role updates
      if (
        status &&
        ["invited", "waiting", "approved", "joined", "blocked"].includes(status)
      ) {
        updateData.status = status;
        if (status === "joined" && !participant.joinedAt) {
          updateData.joinedAt = new Date();
        }
        if (
          status === "blocked" ||
          (status !== "joined" && participant.status === "joined")
        ) {
          updateData.leftAt = new Date();
        }
      }

      if (role && ["host", "cohost", "member", "guest"].includes(role)) {
        // Prevent changing host role (room creator)
        if (participant.role === "host") {
          return NextResponse.json(
            { error: "Cannot change host role" },
            { status: 400 }
          );
        }
        updateData.role = role;
      }
    }

    const updatedParticipant = await RoomParticipant.findByIdAndUpdate(
      participantId,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "room", select: "title status" },
      { path: "user", select: "name email" },
    ]);

    return NextResponse.json({
      success: true,
      participant: updatedParticipant,
      message: actionMessage || "Participant updated successfully",
    });
  } catch (error) {
    console.error("Error updating participant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { roomId: string; participantId: string } }
) {
  try {
    await connectDB();

    const { roomId, participantId } = params;

    const participant = await RoomParticipant.findById(participantId);
    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found" },
        { status: 404 }
      );
    }

    if (participant.room.toString() !== roomId) {
      return NextResponse.json(
        { error: "Participant does not belong to this room" },
        { status: 400 }
      );
    }

    // Cannot remove host (room creator)
    if (participant.role === "host") {
      return NextResponse.json(
        { error: "Cannot remove room host" },
        { status: 400 }
      );
    }

    await RoomParticipant.findByIdAndDelete(participantId);

    return NextResponse.json({
      success: true,
      message: "Participant removed from room",
    });
  } catch (error) {
    console.error("Error removing participant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
