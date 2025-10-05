"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";
import { AlertTriangle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { isSameDay } from "date-fns";
import moment from "moment";
import { AgendaDateProps } from "react-big-calendar";

// react-big-calendar passes date and label props
interface MyCustomHeaderProps {
  label: string;
  date: Date;
  localizer: any;
}

interface CustomDayCellProps {
  label: string;
  date: Date;
  events: any[];
}

interface DateHeaderProps {
  date: Date;
  onAddEvent?: (date: Date) => void;
}

// Custom Event Component
const CustomEvent = ({ event }: { event: any }) => (
  <div className="px-2 py-1 w-full h-full  text-xs font-medium overflow-hidden bg-[#fca5a5]">
    <div className="font-semibold truncate text-[#2d2535]">{event.title}</div>
    {event.description && (
      <div className="text-xs opacity-90 truncate text-[#2d2535]">
        {event.description}
      </div>
    )}
  </div>
);

// Custom Toolbar Component
const CustomToolbar = ({ label, onNavigate, onView, view }: any) => {
  const [cview, setCview] = useState("month");
  return (
    <CardHeader className="flex items-center justify-between p-4">
      {/* Navigation Controls */}
      <div className="flex items-center gap-3">
        <Button onClick={() => onNavigate("PREV")} variant="outline">
          ← Prev
        </Button>

        <Button onClick={() => onNavigate("TODAY")}>Today</Button>

        <Button onClick={() => onNavigate("NEXT")} variant="outline">
          Next →
        </Button>
      </div>

      {/* Title */}
      <CardTitle className="text-xl font-bold m-0">{label}</CardTitle>

      {/* View Controls */}
      <div className="flex items-center gap-2">
        <Select
          value={cview}
          onValueChange={(value) => {
            setCview(value);
            onView(value);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>View</SelectLabel>
              {["month", "week", "day", "agenda"].map((viewName) => (
                <SelectItem value={viewName} key={viewName}>
                  {viewName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </CardHeader>
  );
};

function CustomMonthHeader({ label, date, localizer }: MyCustomHeaderProps) {
  // Example: show day name abbreviation (Mon, Tue...) using localizer
  const weekday = localizer.format(date, "ddd");

  return (
    <div className="w-full border-collapse">
      <div className="">
        <TableCell className="text-center font-medium text-sm text-foreground p-2 uppercase tracking-wide">
          {weekday}
        </TableCell>
      </div>
    </div>
  );
}

function CustomWeekHeader({ label, date, localizer }: MyCustomHeaderProps) {
  const weekday = localizer.format(date, "ddd");
  const dayNum = localizer.format(date, "D"); // numeric day

  return (
    <div className="w-full border-collapse">
      <div className="bg-muted/50 hover:bg-muted/70 transition-colors">
        <TableCell className="text-center font-semibold text-sm text-foreground p-2 uppercase tracking-wide">
          <div className="flex  items-center justify-center gap-2 mb-2">
            <span>{weekday}</span>
            <span className="text-xs opacity-70">{dayNum}</span>
          </div>
        </TableCell>
      </div>
    </div>
  );
}

function CustomDayHeader({ label, date, localizer }: MyCustomHeaderProps) {
  const weekday = localizer.format(date, "dddd"); // e.g. Monday
  const day = localizer.format(date, "D"); // e.g. 7
  const month = localizer.format(date, "MMM"); // e.g. Oct

  return (
    <div className="w-full border-collapse">
      <div className="bg-muted/50 hover:bg-muted/70 transition-colors">
        <TableCell className="text-center font-semibold text-sm text-foreground p-2 uppercase tracking-wide">
          <div className=" flex items-center justify-center gap-2">
            <span>{weekday}</span>
            <span className="text-xs opacity-70">
              {day} {month}
            </span>
          </div>
        </TableCell>
      </div>
    </div>
  );
}
function CustomAgendaDate({ label }: AgendaDateProps) {
  return (
    <div className="w-full border-collapse">
      <div className="bg-muted/50 hover:bg-muted/70 transition-colors">
        <TableCell className="text-left font-medium text-sm text-foreground p-2 tracking-wide">
          {label}
        </TableCell>
      </div>
    </div>
  );
}

function CustomDateHeader({ date, onAddEvent }: DateHeaderProps) {
  const today = new Date();
  const isToday = isSameDay(date, today);

  return (
    <div
      className={cn(
        "flex items-center justify-end w-full text-sm font-semibold mb-1",
        isToday ? "text-primary" : "text-foreground"
      )}
    >
      <span
        className={cn(
          "rounded-full w-6 h-6 flex items-center justify-center transition-colors",
          isToday && "bg-primary text-primary-foreground"
        )}
      >
        {date.getDate()}
      </span>

      {onAddEvent && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onAddEvent(date);
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

export {
  CustomMonthHeader,
  CustomWeekHeader,
  CustomDayHeader,
  CustomAgendaDate,
  CustomEvent,
  CustomToolbar,
  CustomDateHeader,
};
