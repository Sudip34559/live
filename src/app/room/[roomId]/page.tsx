"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import JitsiRoom from "@/components/jitsi-room";
import { useSession } from "next-auth/react";
import JitsiMeetingRoom from "@/components/new-jitsi-room";
function page({ params }: { params: { roomId: string } }) {
  const { roomId } = params;
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userName = searchParams.get("name") || session?.user.name || "Guest";
  return (
    <main className="w-full h-screen">
      <JitsiMeetingRoom roomId={roomId} userName={userName} />
    </main>
  );
}

export default page;
