import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/providers";
import { connectDB } from "@/lib/database";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ message: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await connectDB();

    const { fullName, avatar } = await req.json();
    console.log(fullName, avatar); // --- IGNORE ---

    if (!fullName || avatar.trim().length < 1) {
      return new Response(JSON.stringify({ message: "Name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        name: fullName.trim(),
        image: avatar?.trim() || "",
        isProfileComplete: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return new Response(JSON.stringify({ message: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Profile completed successfully",
        user: {
          name: updatedUser.name,
          image: updatedUser.image,
          isProfileComplete: updatedUser.isProfileComplete,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Complete profile error:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
