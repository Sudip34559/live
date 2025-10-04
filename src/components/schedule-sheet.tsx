import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Check, ChevronDownIcon, ChevronsUpDown } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { DateTime } from "luxon";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import data from "@/data/timezones.json";
import { Checkbox } from "./ui/checkbox";
import Link from "next/link";

interface ScheduleProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const FormSchema = z
  .object({
    title: z.string().nonempty("Title is required"),
    description: z.string().optional(),
    roomType: z
      .enum(["classroom", "meeting", "webinar", "event"])
      .nonoptional("Room type is required"),
    timeZone: z.string(),
    startDate: z.date(),
    endDate: z.date(),
    startTime: z.string(),
    endTime: z.string(),
    isPublic: z.boolean(),
  })
  .refine(
    (data) => {
      const [sh, sm] = data.startTime.split(":").map(Number);
      const [eh, em] = data.endTime.split(":").map(Number);

      const startMinutes = sh * 60 + sm;
      const endMinutes = eh * 60 + em;

      // End must be after start and within 1 hour
      return endMinutes > startMinutes && endMinutes - startMinutes <= 60;
    },
    {
      message: "End time must be within 1 hour after start time",
      path: ["endTime"], // attach error to endTime
    }
  );

const now = DateTime.now();

// Current time in HH:mm
const nowTime = now.toFormat("HH:mm");

// Time + 4 hours
const plus4Time = now.plus({ hours: 1 }).toFormat("HH:mm");

export function ScheduleSheet({ isOpen, onOpenChange }: ScheduleProps) {
  const { data: session } = useSession();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      description: "",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      startDate: new Date(),
      startTime: nowTime,
      endDate: new Date(),
      endTime: plus4Time,
      isPublic: true,
    },
  });
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Schedule Room</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form className="w-full h-full flex flex-col justify-between overflow-y-scroll scrollbar-thin scrollbar-thumb-[#8670c7] scrollbar-track-[#f7f3f900] dark:scrollbar-thumb-[#ad99e2] dark:scrollbar-track-[#1c191700]">
            <div className="w-full px-4 flex flex-col gap-3">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Room title"
                        {...field}
                        defaultValue={`${session?.user.name}'s room`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional details..."
                        className="min-h-[80px] resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roomType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="classroom">Classroom</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeZone"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Time zone</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? data.timezones.find(
                                  (timezone) => timezone.value === field.value
                                )?.label
                              : "Select time zone"}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[351px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search time zone..."
                            className="h-9"
                          />
                          <CommandList className="overflow-y-scroll scrollbar-thin scrollbar-thumb-[#8670c7] scrollbar-track-[#fff0] dark:scrollbar-thumb-[#ad99e2] dark:scrollbar-track-[#1c191700]">
                            <CommandEmpty>No time zone found.</CommandEmpty>
                            <CommandGroup>
                              {data.timezones.map((timezone) => (
                                <CommandItem
                                  value={timezone.label}
                                  key={timezone.value}
                                  onSelect={() => {
                                    form.setValue("timeZone", timezone.value);
                                  }}
                                >
                                  {timezone.label}
                                  <Check
                                    className={cn(
                                      "ml-auto",
                                      timezone.value === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => {
                    const [openFrom, setOpenFrom] = useState(false);
                    return (
                      <FormItem className="flex flex-1 flex-col gap-3">
                        <FormLabel>Start</FormLabel>
                        <Popover open={openFrom} onOpenChange={setOpenFrom}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              id="date-from"
                              className="w-full justify-between font-normal"
                            >
                              {field.value
                                ? field.value.toLocaleDateString("en-US", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Select date"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <FormControl>
                              <Calendar
                                mode="single"
                                selected={field.value}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  return date < today;
                                }}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setOpenFrom(false);
                                }}
                              />
                            </FormControl>
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    );
                  }}
                />
                <Controller
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="time-from" className="invisible px-1">
                        Time
                      </Label>
                      <Input
                        type="time"
                        id="time-from"
                        step={60}
                        {...field}
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </div>
                  )}
                />
              </div>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => {
                    const [openFrom, setOpenFrom] = useState(false);
                    return (
                      <FormItem className="flex flex-1 flex-col gap-3">
                        <FormLabel>End</FormLabel>
                        <Popover open={openFrom} onOpenChange={setOpenFrom}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              disabled
                              id="date-from"
                              className="w-full justify-between font-normal cursor-not-allowed"
                            >
                              {field.value
                                ? field.value.toLocaleDateString("en-US", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Select date"}
                              <ChevronDownIcon />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto overflow-hidden p-0"
                            align="start"
                          >
                            <FormControl>
                              <Calendar
                                mode="single"
                                selected={field.value}
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);
                                  return date < today;
                                }}
                                onSelect={(date) => {
                                  field.onChange(date);
                                  setOpenFrom(false);
                                }}
                              />
                            </FormControl>
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    );
                  }}
                />
                <Controller
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="time-from" className="invisible px-1">
                        Time
                      </Label>
                      <Input
                        type="time"
                        id="time-from"
                        step={60}
                        {...field}
                        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </div>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex gap-2 items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value} // ✅ use checked, not value
                        onCheckedChange={field.onChange} // ✅ hook up change handler
                        disabled={true}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Public room
                    </FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetDescription className="p-4 ">
              <p>
                You can create a meeting room that lasts up to{" "}
                <strong>1 hour</strong> and allows a maximum of{" "}
                <strong>20 participants</strong>.
              </p>
              <p>
                For longer meetings or larger participant capacity, please{" "}
                <Link
                  href="/plans"
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  view our Plans & Pricing
                </Link>
                .
              </p>
            </SheetDescription>

            <SheetFooter>
              <Button type="submit">Schedule</Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
