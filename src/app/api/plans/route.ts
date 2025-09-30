// app/api/plans/route.ts - GET all plans and CREATE new plan
import { NextRequest, NextResponse } from "next/server";
import { Plan } from "@/models/Plan";
import { connectDB } from "@/lib/database";
import { planSchema } from "@/types/types";

// GET /api/plans - Get all plans
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sortBy = searchParams.get("sortBy") || "order";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      Plan.find()
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email"),
      Plan.countDocuments(),
    ]);

    return NextResponse.json({
      success: true,
      data: plans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/plans - Create new plan
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = planSchema.parse(body);

    // Check if plan key already exists
    const existingPlan = await Plan.findOne({ planKey: validatedData.planKey });
    if (existingPlan) {
      return NextResponse.json(
        { success: false, error: "Plan key already exists" },
        { status: 400 }
      );
    }

    const plan = new Plan(validatedData);
    await plan.save();

    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
