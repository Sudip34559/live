import { NextRequest, NextResponse } from "next/server";
import { User } from "@/models/User";
import { connectDB } from "@/lib/database";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = await params;

    // Find the current user
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Toggle the isVerified status
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isVerified: !user.isVerified },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Somthing went wrong" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `User verification status ${
        updatedUser.isVerified ? "enabled" : "disabled"
      }`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error toggling verification status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
