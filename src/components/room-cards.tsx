"use client";
import { Card, CardTitle } from "@/components/ui/card";
import { CalendarRange, Link, Merge } from "lucide-react";
import { useState } from "react";
import { QuickCreate } from "./quick-create-dialog";

export function RoomCards() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-3">
      <Card
        className="@container/card group/card"
        onClick={() => setIsCreateOpen(!isCreateOpen)}
      >
        <div className="w-full h-full flex justify-center items-center gap-2">
          <Link className="group-hover/card:text-[#c0aafd]" />
          <CardTitle className="@xl/main:hidden block @2xl/main:block">
            Create Quick Link
          </CardTitle>
        </div>
      </Card>
      <Card className="@container/card group/card">
        <div className="w-full h-full flex justify-center items-center gap-2">
          <CalendarRange className="group-hover/card:text-[#c0aafd]" />
          <CardTitle className="@xl/main:hidden block @2xl/main:block">
            Schedule Meeting
          </CardTitle>
        </div>
      </Card>
      <Card className="@container/card group/card">
        <div className="w-full h-full flex justify-center items-center gap-2">
          <Merge className="group-hover/card:text-[#c0aafd]" />
          <CardTitle className="@xl/main:hidden block @2xl/main:block">
            Join Room
          </CardTitle>
        </div>
      </Card>

      <QuickCreate isOpen={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
