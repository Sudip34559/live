// Updated DialogDemo Component
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { toast } from "sonner";
import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { createQuickRoom } from "@/apis/api";
import { useSession } from "next-auth/react";

interface QuickCreateProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const FormSchema = z.object({
  title: z.string().nonempty("Title is required"),
  roomType: z
    .enum(["classroom", "meeting", "webinar", "event"])
    .nonoptional("Room type is required"),
});

export function QuickCreate({ isOpen, onOpenChange }: QuickCreateProps) {
  const { data: session } = useSession();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // console.log(timeZone);

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("submit");
    await createQuickRoom({ ...data, timeZone }).then((res) => {
      if (res.data.success) {
        console.log(res.data);
        form.reset({
          title: "",
          roomType: "meeting",
        });
        onOpenChange(false);
        toast(`${res.data.room.roomType} created successfully`, {
          description: `Today ${res.data.room.startTime} to ${res.data.room.endTime}`,
          action: {
            label: "✗",
            onClick: () => console.log("Undo"),
          },
        });
      }
    });
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <Form {...form}>
        <form>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Room</DialogTitle>
            </DialogHeader>
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
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
}
