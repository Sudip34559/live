// components/ThemedCalendar.tsx
"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calender.css";
import { Card } from "./ui/card";
import { useTheme } from "next-themes";
import { Label } from "./ui/label";
import {
  CustomDateHeader,
  CustomEvent,
  CustomMonthHeader,
  CustomToolbar,
} from "./ui/custom-calender";

const localizer = momentLocalizer(moment);

export default function ThemedCalendar() {
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const { theme } = useTheme();

  // Sample events - replace with your data
  const events = [
    {
      id: 1,
      title: "Team Meeting",
      description: "Weekly standup discussion",
      start: new Date(2025, 9, 4, 10, 0),
      end: new Date(2025, 9, 4, 11, 0),
      type: "meeting",
    },
    {
      id: 2,
      title: "Client Presentation",
      description: "Q4 project review",
      start: new Date(2025, 9, 5, 14, 0),
      end: new Date(2025, 9, 5, 15, 30),
      type: "presentation",
    },
    {
      id: 3,
      title: "Development Sprint",
      description: "Feature implementation",
      start: new Date(2025, 9, 6, 9, 0),
      end: new Date(2025, 9, 6, 17, 0),
      type: "work",
    },
  ];

  const handleSelectEvent = (event: any) => {
    console.log("Event selected:", event);
    // Add your event handling logic here
  };

  const handleSelectSlot = (slotInfo: any) => {
    console.log("Slot selected:", slotInfo);
    // Add your slot selection logic here (e.g., create new event)
  };

  return (
    <Card className={`p-4 mx-6 min-h-[480px] min-w-[640px] calendar-wrapper`}>
      <Calendar
        className="w-full h-full"
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100vh - 146px)", minHeight: "480px" }}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        popup
        selectable
        showMultiDayTimes
        step={15}
        timeslots={4}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent,
          month: {
            header: CustomMonthHeader,
            event: CustomEvent,
            dateHeader: CustomDateHeader,
          },
        }}
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
            border: "none",
            borderRadius: "6px",
            fontWeight: "500",
          },
        })}
        dayPropGetter={(date) => {
          const isToday = moment(date).isSame(moment(), "day");
          const isWeekend =
            moment(date).day() === 0 || moment(date).day() === 6;
          console.log(moment(date), isWeekend);

          return {
            style: {
              backgroundColor: "#2d2535",
            },
          };
        }}
        slotPropGetter={(date) => ({
          style: {
            backgroundColor: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
          },
        })}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        formats={{
          timeGutterFormat: "h:mm A",
          eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            localizer?.format(start, "h:mm A", culture) +
            " - " +
            localizer?.format(end, "h:mm A", culture),
          agendaTimeFormat: "h:mm A",
          agendaTimeRangeFormat: ({ start, end }, culture, localizer) =>
            localizer?.format(start, "h:mm A", culture) +
            " - " +
            localizer?.format(end, "h:mm A", culture),
        }}
      />
    </Card>
  );
}
