import { NextRequest, NextResponse } from "next/server";
import { Host } from "@/models/Host";
import { User } from "@/models/User";
import { connectDB } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { userId, businessName, businessType, description, maxClients } =
      await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Check if user exists and is verified
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: "User must be verified to become a host" },
        { status: 403 }
      );
    }

    // Check if user is already a host
    const existingHost = await Host.findOne({ userId });
    if (existingHost) {
      return NextResponse.json(
        { error: "User is already a host" },
        { status: 409 }
      );
    }

    const newHost = await Host.create({
      userId,
      businessName,
      businessType,
      description,
      maxClients: maxClients || 10,
      subscription: {
        plan: "free",
        features: ["basic_meetings", "up_to_10_clients"],
      },
    });

    await newHost.populate("userId", "name email");

    return NextResponse.json(newHost, { status: 201 });
  } catch (error) {
    console.error("Error creating host:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
