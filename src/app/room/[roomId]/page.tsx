"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import JitsiRoom from "@/components/jitsi-room";
function page({ params }: { params: { roomId: string } }) {
  const { roomId } = params;
  const searchParams = useSearchParams();
  const userName = searchParams.get("name") || "guest";
  return (
    <main className="w-full h-screen">
      <JitsiRoom roomId={roomId} userName={userName} />
    </main>
  );
}

export default page;
