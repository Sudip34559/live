"use client";

import { useEffect, useState } from "react";
import { Calendar, CalendarEvent } from "./ui/custom-calendar";
import { getRoomByTime } from "@/apis/api";
import { IRoom } from "@/models/Room";

const sampleEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Meeting",
    start: new Date(2025, 9, 5, 10, 0),
    end: new Date(2025, 9, 6, 11, 30),
    color: "primary",
    description: "Weekly team sync",
    category: "Work",
  },
  {
    id: "2",
    title: "Project Review",
    start: new Date(2025, 9, 5, 14, 0),
    end: new Date(2025, 9, 5, 15, 0),
    color: "success",
    description: "Quarterly project review",
    category: "Project",
  },
  {
    id: "3",
    title: "Client Call",
    start: new Date(2025, 9, 6, 9, 30),
    end: new Date(2025, 9, 6, 10, 30),
    color: "info",
    description: "Client consultation",
    category: "Client",
  },
  {
    id: "4",
    title: "Lunch Break",
    start: new Date(2025, 9, 6, 12, 0),
    end: new Date(2025, 9, 6, 13, 0),
    color: "warning",
    description: "Team lunch",
    category: "Break",
  },
];

export default function EnhancedCalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);

  useEffect(() => {
    getRoomByTime({ startTime, endTime }).then((res) => {
      if (res.status) {
        const events = res.data.rooms.map((room: IRoom) => {
          return {
            id: room._id,
            title: room.title,
            start: new Date(room.startTime),
            end: new Date(room.endTime),
            color: "warning",
            description: room.description,
            category: room.roomType,
          };
        });

        setEvents(events);
      }
    });
  }, []);

  const handleEventClick = (event: CalendarEvent) => {
    console.log("Event clicked:", event);
  };

  const handleDateClick = (date: Date) => {
    console.log("Date/Time clicked:", date);
  };

  const handleEventCreate = (date: Date) => {
    console.log("Create event for:", date);
    // Add your event creation logic here
  };

  return (
    <div className="container mx-auto p-6">
      <Calendar
        events={events}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        onEventCreate={handleEventCreate}
        defaultView="month"
        timeSlotDuration={60}
        dayStartHour={0}
        dayEndHour={24}
        className="max-w-full"
      />
    </div>
  );
}
