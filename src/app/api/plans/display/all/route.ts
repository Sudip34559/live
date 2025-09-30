import { connectDB } from "@/lib/database";
import { Plan } from "@/models/Plan";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const plans = await Plan.find({
      isPublic: true,
      isActive: true,
    }).sort({ order: 1 });

    return NextResponse.json({
      success: true,
      data: plans,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
