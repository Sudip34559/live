import { NextRequest, NextResponse } from "next/server";
import { Host } from "@/models/Host";
import { Client } from "@/models/Client";
import { User } from "@/models/User";
import { connectDB } from "@/lib/database";

export async function POST(
  request: NextRequest,
  { params }: { params: { hostId: string } }
) {
  try {
    await connectDB();

    const { hostId } = await params;
    const { userId, invitedBy, department, role, permissions } =
      await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    // Verify host exists
    const host = await Host.findById(hostId);
    if (!host) {
      return NextResponse.json({ error: "Host not found" }, { status: 404 });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already a client of this host
    const existingClient = await Client.findOne({ userId, hostId });
    if (existingClient) {
      return NextResponse.json(
        { error: "User is already a client of this host" },
        { status: 409 }
      );
    }

    // Check host client limit
    const clientCount = await Client.countDocuments({
      hostId,
      status: { $in: ["pending", "active"] },
    });

    const newClient = await Client.create({
      userId,
      hostId,
      status: host.settings.autoAcceptClients ? "active" : "pending",
      permissions: permissions || {},
      metadata: {
        department,
        role,
        tags: [],
      },
      invitedBy,
      joinedAt: new Date(),
    });

    await newClient.populate([
      { path: "userId", select: "name email" },
      { path: "hostId", select: "businessName hostCode" },
      { path: "invitedBy", select: "name email" },
    ]);

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error("Error adding client:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { hostId: string } }
) {
  try {
    await connectDB();

    const { hostId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const query: any = { hostId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      Client.find(query)
        .populate("userId", "name email")
        .populate("invitedBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Client.countDocuments(query),
    ]);

    return NextResponse.json({
      clients,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
