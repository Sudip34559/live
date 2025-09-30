"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { VariantProps } from "class-variance-authority";
import PageLoder from "@/components/page-loader";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
interface ProfileData {
  fullName: string;
  avatar?: string;
}

export default function CompleteProfile() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/sign-in");
      return;
    }

    if (session.user.isProfileComplete) {
      router.push("/dashboard");
      return;
    }

    // Pre-fill with existing data
    if (session.user.name) {
      setProfileData((prev) => ({
        ...prev,
        fullName: session.user.name || "",
      }));
    }
  }, [session, status, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        // Update the session
        await update();
        toast("Profile updated successfully!", {
          action: { label: "✕", onClick: () => console.log("Undo") },
        });
        router.push("/dashboard");
      } else {
        const data = await response.json();
        toast("Failed to update profile", {
          description: data.error || "An unknown error occurred",
          action: {
            label: "✕",
            onClick: () => console.log("Undo"),
          },
        });
      }
    } catch (error) {
      toast("Something went wrong", {
        description: (error as Error).message,
        action: {
          label: "✕",
          onClick: () => console.log("Undo"),
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return <PageLoder />;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-6 items-center p-6 justify-center w-full h-screen "
      )}
    >
      <Card className="overflow-hidden p-0 max-w-[766px]   min-w-[380px]">
        <CardContent className="grid p-0 md:grid-cols-2 ">
          <form
            className="p-6 md:p-8 min-w-[380px] max-w-[380px]"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold"> Complete Your Profile</h1>
                <p className="text-muted-foreground text-balance">
                  complete your account setup
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="text">Full Name</Label>
                <Input
                  id="text"
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  required
                  value={profileData.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="avatar">Profile Image</Label>
                <Input
                  id="avatar"
                  name="avatar"
                  type="url"
                  value={profileData.avatar}
                  onChange={handleChange}
                  placeholder="https://example.com/your-image.jpg"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "loading..." : "save & continue"}
              </Button>
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="/login.jpeg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.7] "
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
