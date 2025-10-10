"use client";

import React, { useState, useMemo } from "react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isToday,
  startOfDay,
  endOfDay,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  description?: string;
  category?: string;
}

export interface EnhancedCalendarProps {
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventCreate?: (date: Date) => void;
  className?: string;
  defaultView?: "month" | "week" | "day";
  defaultDate?: Date;
  timeSlotDuration?: number; // in minutes
  dayStartHour?: number;
  dayEndHour?: number;
}

type ViewType = "month" | "week" | "day";

const EVENT_COLORS = [
  "bg-primary text-primary-foreground border-primary/50",
  "bg-secondary text-secondary-foreground border-secondary/50",

  "bg-destructive text-destructive-foreground border-destructive/50",
  "bg-green-500 text-white border-green-600",
  "bg-yellow-500 text-white border-yellow-600",
  "bg-blue-500 text-white border-blue-600",
];

export function Calendar({
  events = [],
  onEventClick,
  onDateClick,
  onEventCreate,
  className,
  defaultView = "month",
  defaultDate = new Date(),
  timeSlotDuration = 30,
  dayStartHour = 0,
  dayEndHour = 24,
}: EnhancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(defaultDate);
  const [view, setView] = useState<ViewType>(defaultView);

  // Generate time slots for timeline views - Fixed to respect time range
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = dayStartHour; hour <= dayEndHour; hour++) {
      for (let minute = 0; minute < 60; minute += timeSlotDuration) {
        // Skip creating slots beyond the end hour
        if (hour === dayEndHour && minute > 0) break;
        const time = setMinutes(setHours(new Date(), hour), minute);
        slots.push(time);
      }
    }
    return slots;
  }, [dayStartHour, dayEndHour, timeSlotDuration]);

  // Navigation functions
  const navigate = (direction: "prev" | "next") => {
    const amount = direction === "next" ? 1 : -1;

    if (view === "month") {
      setCurrentDate((prev) => addMonths(prev, amount));
    } else if (view === "week") {
      setCurrentDate((prev) => addWeeks(prev, amount));
    } else {
      setCurrentDate((prev) => addDays(prev, amount));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get events for a specific date and time slot
  const getEventsForTimeSlot = (date: Date, timeSlot: Date) => {
    const slotStart = setHours(
      setMinutes(date, getMinutes(timeSlot)),
      getHours(timeSlot)
    );
    const slotEnd = new Date(slotStart.getTime() + timeSlotDuration * 60000);

    return events.filter((event) => {
      return event.start < slotEnd && event.end > slotStart;
    });
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = startOfDay(event.start);
      const eventEnd = endOfDay(event.end);
      const targetDate = startOfDay(date);

      return targetDate >= eventStart && targetDate <= eventEnd;
    });
  };

  // Calculate event position and height for timeline - Fixed calculation
  const getEventStyle = (event: CalendarEvent, date: Date) => {
    const dayStart = setHours(setMinutes(date, 0), dayStartHour);
    const eventStartTime = event.start.getTime();
    const eventEndTime = event.end.getTime();

    // Calculate minutes from day start
    const startMinutes = Math.max(
      0,
      (eventStartTime - dayStart.getTime()) / (1000 * 60)
    );
    const endMinutes = (eventEndTime - dayStart.getTime()) / (1000 * 60);
    const durationMinutes = endMinutes - startMinutes;

    const slotHeight = 60; // Height per slot in pixels
    const top = (startMinutes / timeSlotDuration) * slotHeight;
    const height = Math.max(
      20,
      (durationMinutes / timeSlotDuration) * slotHeight - 2
    );

    return {
      top: `${Math.max(0, top)}px`,
      height: `${height}px`,
      position: "absolute" as const,
      left: "4px",
      right: "4px",
      zIndex: 10,
    };
  };

  // Generate calendar days based on view
  const calendarDays = useMemo(() => {
    if (view === "month") {
      const start = startOfWeek(startOfMonth(currentDate));
      const end = endOfWeek(endOfMonth(currentDate));
      return eachDayOfInterval({ start, end });
    } else if (view === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return eachDayOfInterval({ start, end });
    } else {
      return [currentDate];
    }
  }, [currentDate, view]);

  // Format title based on view
  const getTitle = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy");
    } else if (view === "week") {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
    } else {
      return format(currentDate, "EEEE, MMMM d, yyyy");
    }
  };

  const TimelineEvent = ({
    event,
    date,
  }: {
    event: CalendarEvent;
    date: Date;
  }) => (
    <div
      style={getEventStyle(event, date)}
      className={cn(
        "text-xs cursor-pointer hover:opacity-90 transition-all duration-200 rounded border-l-4 px-2 py-1 shadow-sm overflow-hidden",
        EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)]
      )}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick?.(event);
      }}
    >
      <div className="font-medium truncate">{event.title}</div>
      <div className="text-xs opacity-75 truncate">
        {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
      </div>
    </div>
  );

  const TimeSlotCell = ({ day, timeSlot }: { day: Date; timeSlot: Date }) => {
    const [isHovered, setIsHovered] = useState(false);
    const slotTime = setHours(
      setMinutes(day, getMinutes(timeSlot)),
      getHours(timeSlot)
    );

    return (
      <div
        className={cn(
          "h-[60px] border-b border-border/50 relative cursor-pointer transition-colors duration-200",
          "hover:bg-muted/30",
          isHovered && "bg-muted/40"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onDateClick?.(slotTime)}
      >
        {onEventCreate && isHovered && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-100 transition-opacity z-20"
            onClick={(e) => {
              e.stopPropagation();
              onEventCreate(slotTime);
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  const DayCell = ({ day }: { day: Date }) => {
    const [isHovered, setIsHovered] = useState(false);
    const dayEvents = getEventsForDate(day);
    const isCurrentMonth =
      view === "month" ? isSameMonth(day, currentDate) : true;
    const isCurrentDay = isSameDay(day, new Date());
    const createEvent =
      day.setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0);
    // console.log(createEvent);

    return (
      <div
        className={cn(
          "min-h-[120px] p-2 border border-border cursor-pointer transition-colors duration-200",
          "hover:bg-muted/30",
          !isCurrentMonth && "text-muted-foreground bg-muted/20",
          isCurrentDay && "bg-primary/10 border-primary"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onDateClick?.(day)}
      >
        <div className="flex justify-between items-center mb-2">
          <span
            className={cn(
              "text-sm font-medium",
              isCurrentDay && "text-primary font-bold"
            )}
          >
            {format(day, view === "month" ? "d" : "EEE d")}
          </span>
          {onEventCreate && isHovered && createEvent && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onEventCreate(day);
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="space-y-1">
          {dayEvents.slice(0, 3).map((event) => (
            <Badge
              key={event.id}
              variant="secondary"
              className={cn(
                "text-xs cursor-pointer hover:opacity-80 transition-opacity mb-1 block truncate",
                EVENT_COLORS[Math.floor(Math.random() * EVENT_COLORS.length)]
              )}
              onClick={(e) => {
                e.stopPropagation();
                onEventClick?.(event);
              }}
            >
              {event.title}
            </Badge>
          ))}
          {dayEvents.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{dayEvents.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  // Fixed header alignment to match grid structure
  const TimelineHeader = () => {
    const days = view === "day" ? [currentDate] : calendarDays;

    return (
      <div className="flex border-b border-t border-border bg-muted/50">
        {/* Time column header - Fixed width to match time column */}
        <div className="w-[100px] border-r border-border p-3 text-center font-medium text-muted-foreground flex-shrink-0">
          Time
        </div>

        {/* Day headers - Fixed grid structure */}
        <div className="flex flex-1">
          {days.map((day, index) => {
            const isCurrentDay = isSameDay(day, new Date());
            return (
              <div
                key={index}
                className={cn(
                  "flex-1 border-r border-border last:border-r-0 p-3 text-center font-medium",
                  isCurrentDay && "bg-primary/10 text-primary font-bold"
                )}
              >
                <div className="text-sm">{format(day, "EEE")}</div>
                <div className="text-lg">{format(day, "d")}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const TimelineView = ({ days }: { days: Date[] }) => (
    <div className="relative">
      <TimelineHeader />
      <div className="flex">
        {/* Time column - Fixed width and styling */}
        <div className="w-[100px] border-r border-border bg-muted/30 flex-shrink-0">
          {timeSlots.map((slot, index) => (
            <div
              key={index}
              className="h-[60px] border-b border-border/50 flex items-center justify-center text-xs text-muted-foreground px-2"
            >
              {format(slot, "h:mm a")}
            </div>
          ))}
        </div>

        {/* Days columns - Fixed structure */}
        <div className="flex flex-1">
          {days.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="flex-1 border-r border-border last:border-r-0 relative"
            >
              {timeSlots.map((slot, slotIndex) => (
                <TimeSlotCell key={slotIndex} day={day} timeSlot={slot} />
              ))}

              {/* Events overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="relative h-full pointer-events-auto">
                  {getEventsForDate(day).map((event) => (
                    <TimelineEvent key={event.id} event={event} date={day} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <Card className={cn("w-full min-w-[1020px]", className)}>
      <CardHeader className="border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <h2 className="text-2xl font-bold">{getTitle()}</h2>

          <div className="flex items-center space-x-2">
            <Select
              value={view}
              onValueChange={(value: ViewType) => setView(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-hidden">
        {view === "month" && (
          <div>
            <div className="grid grid-cols-7 border-b border-t border-border bg-muted/50">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="p-3 text-center font-medium text-muted-foreground border-r border-border last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                <DayCell key={index} day={day} />
              ))}
            </div>
          </div>
        )}
        {(view === "week" || view === "day") && (
          <TimelineView days={calendarDays} />
        )}
      </CardContent>
    </Card>
  );
}
