// components/JitsiMeeting.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader2, Users, Clock } from "lucide-react";

interface RoomData {
  isModerator: boolean;
  jwt: string;
  roomName: string;
  participantCount: number;
  remainingSlots: number;
  maxParticipants: number;
  blocked: boolean;
}

interface JitsiMeetingRoomProps {
  roomId: string;
  userName: string;
  onMeetingEnd?: () => void;
}

interface JitsiApi {
  addEventListener: (event: string, callback: (data?: any) => void) => void;
  removeEventListener: (event: string, callback: (data?: any) => void) => void;
  executeCommand: (command: string, ...args: any[]) => void;
  getNumberOfParticipants: () => number;
  dispose: () => void;
}

export default function JitsiMeetingRoom({
  roomId,
  userName,
  onMeetingEnd,
}: JitsiMeetingRoomProps) {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [waitingForModerator, setWaitingForModerator] = useState(false);

  const apiRef = useRef<JitsiApi | null>(null);
  const hasLeftRoom = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Fetch room access token and validate
  useEffect(() => {
    let isMounted = true;

    const fetchRoomAccess = async () => {
      try {
        const response = await fetch(
          `/api/room/${roomId}/quick-join?name=${encodeURIComponent(userName)}`
        );

        if (!response.ok) {
          throw new Error(`Failed to join: ${response.status}`);
        }

        const data: RoomData = await response.json();

        if (!isMounted) return;

        if (data.blocked) {
          setError(
            `Room is full (${data.participantCount}/${data.maxParticipants}). Please try again later.`
          );
        } else {
          setRoomData(data);
          // If not moderator, expect to wait in lobby
          if (!data.isModerator) {
            setWaitingForModerator(true);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to join room. Please try again."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRoomAccess();

    return () => {
      isMounted = false;
      if (
        roomData &&
        !roomData.blocked &&
        !hasLeftRoom.current &&
        !meetingEnded
      ) {
        leaveRoom();
      }
    };
  }, [roomId, userName]);

  // Notify server when leaving
  const leaveRoom = async () => {
    if (hasLeftRoom.current) return;
    hasLeftRoom.current = true;

    try {
      await fetch(`/api/room/${roomId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      console.log("✅ Successfully left room");
    } catch (err) {
      console.error("❌ Failed to notify server of leave:", err);
    }
  };

  // Handle meeting end
  const handleMeetingEnd = () => {
    if (meetingEnded) return;

    console.log("🛑 Meeting ending...");
    setMeetingEnded(true);

    // Cleanup API
    if (apiRef.current) {
      try {
        apiRef.current.dispose();
      } catch (err) {
        console.error("API dispose error:", err);
      }
    }

    leaveRoom();

    if (onMeetingEnd) {
      onMeetingEnd();
    }
  };

  // API ready handler - CRITICAL for moderator-only lobby control
  const handleApiReady = (api: JitsiApi) => {
    apiRef.current = api;
    console.log("🎬 Jitsi API ready");

    // IMPORTANT: Only enable lobby when user becomes moderator
    // This prevents first joiners from auto-promoting and controlling lobby
    const handleRoleChanged = (event: any) => {
      console.log(`👤 Role changed: ${event.id} -> ${event.role}`);

      // Only toggle lobby if THIS user becomes moderator
      if (event.role === "moderator" && roomData?.isModerator) {
        console.log("🔐 Enabling lobby (moderator joined)");
        api.executeCommand("toggleLobby", true);
      }
    };

    // Handle when participant joins from lobby
    const handleParticipantJoined = (event: any) => {
      console.log(`✅ Participant joined: ${event.displayName || event.id}`);

      // Clear waiting state if we were in lobby
      if (waitingForModerator && !roomData?.isModerator) {
        setWaitingForModerator(false);
      }
    };

    // Handle lobby knock (someone requesting to join)
    const handleKnockingParticipant = (event: any) => {
      console.log(`🚪 Knock from: ${event.participant?.name || "Guest"}`);
    };

    // Handle when conference is joined
    const handleVideoConferenceJoined = (event: any) => {
      console.log(`🎥 Joined conference: ${event.roomName}`);

      // If moderator, ensure lobby is on
      if (roomData?.isModerator) {
        setTimeout(() => {
          api.executeCommand("toggleLobby", true);
          console.log("🔐 Lobby enabled by moderator");
        }, 1000);
      }

      // Clear waiting state
      setWaitingForModerator(false);
    };

    // Handle meeting end events
    const handleReadyToClose = () => {
      console.log("🚪 Ready to close");
      handleMeetingEnd();
    };

    const handleVideoConferenceLeft = () => {
      console.log("👋 Left conference");
      handleMeetingEnd();
    };

    // Register all event listeners
    api.addEventListener("participantRoleChanged", handleRoleChanged);
    api.addEventListener("participantJoined", handleParticipantJoined);
    api.addEventListener("knockingParticipant", handleKnockingParticipant);
    api.addEventListener("videoConferenceJoined", handleVideoConferenceJoined);
    api.addEventListener("readyToClose", handleReadyToClose);
    api.addEventListener("videoConferenceLeft", handleVideoConferenceLeft);

    // Cleanup function
    cleanupRef.current = () => {
      if (apiRef.current) {
        apiRef.current.removeEventListener(
          "participantRoleChanged",
          handleRoleChanged
        );
        apiRef.current.removeEventListener(
          "participantJoined",
          handleParticipantJoined
        );
        apiRef.current.removeEventListener(
          "knockingParticipant",
          handleKnockingParticipant
        );
        apiRef.current.removeEventListener(
          "videoConferenceJoined",
          handleVideoConferenceJoined
        );
        apiRef.current.removeEventListener("readyToClose", handleReadyToClose);
        apiRef.current.removeEventListener(
          "videoConferenceLeft",
          handleVideoConferenceLeft
        );
      }
    };

    return cleanupRef.current;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto mt-8">
        <CardContent className="p-8 space-y-4">
          <div className="flex items-center space-x-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Connecting to meeting room...
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error or meeting ended state
  if (error || meetingEnded) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="p-8">
          <Alert variant={meetingEnded ? "default" : "destructive"}>
            {meetingEnded ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <AlertTitle className="text-lg font-semibold">
              {meetingEnded ? "Meeting Ended" : "Cannot Join Room"}
            </AlertTitle>
            <AlertDescription className="mt-2">
              {meetingEnded
                ? "Thank you for joining. You can now close this window or return to the dashboard."
                : error}
            </AlertDescription>
          </Alert>
          <div className="mt-6 space-y-3">
            <Button
              onClick={() => window.history.back()}
              className="w-full"
              variant="default"
            >
              ← Back to Dashboard
            </Button>
            {!meetingEnded && (
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                variant="outline"
              >
                Try Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!roomData) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="p-8 text-center">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Room data unavailable</AlertTitle>
          </Alert>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Render Jitsi Meeting
  return (
    <div className="w-full h-screen bg-black relative">
      {/* Waiting indicator for non-moderators */}
      {waitingForModerator && !roomData.isModerator && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Alert className="bg-yellow-50 border-yellow-200">
            <Clock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              Waiting for moderator to admit you...
            </AlertDescription>
          </Alert>
        </div>
      )}

      <JitsiMeeting
        domain={process.env.NEXT_PUBLIC_JITSI_DOMAIN || "live.edusathi.net"}
        roomName={roomData.roomName}
        jwt={roomData.jwt}
        onApiReady={handleApiReady}
        configOverwrite={{
          // Lobby configuration - CRITICAL for moderator-only access
          lobby: {
            autoKnock: true, // Auto-send join request
            enableChat: true, // Allow lobby chat
            showHangUp: true, // Show hangup in lobby
          },

          // Security UI - expose controls to moderators
          securityUi: {
            hideLobbyButton: false, // Keep lobby toggle visible
            disableLobbyPassword: false, // Allow password option
          },

          // Require display name for clarity
          requireDisplayName: true,

          // Prejoin configuration based on role
          prejoinConfig: {
            enabled: !roomData.isModerator, // Skip prejoin for moderators
            hideDisplayName: false,
            hideExtraJoinButtons: ["by-phone"],
          },

          localRecording: {
            // Whether to disable local recording or not.
            disable: false,

            // Whether to notify all participants when a participant is recording locally.
            notifyAllParticipants: false,

            // Whether to disable the self recording feature (only local participant streams).
            disableSelfRecording: false,
          },

          // Start settings
          startWithAudioMuted: !roomData.isModerator, // Moderators unmuted
          startWithVideoMuted: false,

          // Disable features that could bypass lobby
          p2p: { enabled: false }, // Disable P2P to ensure lobby works
          disableDeepLinking: true,

          // Display
          defaultLocalDisplayName: roomData.isModerator ? "Moderator" : "Me",
          defaultRemoteDisplayName: "Participant",
          readOnlyName: false,

          // Moderator indicators
          disableModeratorIndicator: false, // Show moderator badge
          disableJoinLeaveNotifications: false, // Show join/leave for moderators

          // Room security
          enableInsecureRoomNameWarning: true,

          // Permissions - strict moderator-only controls
          disableRemoteMute: !roomData.isModerator, // Only mods can mute others
          enableRemoteVideoMenu: roomData.isModerator, // Only mods see video menu
          disableRemoteControl: !roomData.isModerator,
          disableSelfDemote: roomData.isModerator, // Prevent mod self-demotion

          // Participant pane permissions
          participantsPane: {
            hideModeratorSettingsTab: !roomData.isModerator,
            hideMoreActionsButton: !roomData.isModerator,
            hideMuteAllButton: !roomData.isModerator,
          },

          // Feature flags
          disablePolls: false,
          disableReactions: false,

          // Toolbar buttons - conditional on role
          toolbarButtons: [
            "microphone",
            "camera",
            "desktop",
            "fullscreen",
            "hangup",
            "chat",
            "raisehand",
            "participants-pane",
            "tileview",
            "settings",
            // Moderator-only buttons
            ...(roomData.isModerator
              ? [
                  "security", // Lobby/password controls
                  "recording",
                  "livestreaming",
                  "videoquality",
                  "stats",
                  "closedcaptions",
                ]
              : []),
          ],

          // Toolbar config
          toolbarConfig: {
            initialTimeout: 20000,
            timeout: 4000,
            alwaysVisible: false,
            autoHideWhileChatIsOpen: false,
          },

          // Notifications
          notifyOnConferenceDestruction: true,

          // Misc
          enableNoisyMicDetection: true,
          disableShowMoreStats: !roomData.isModerator,
        }}
        interfaceConfigOverwrite={{
          // Branding
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          SHOW_POWERED_BY: false,
          APP_NAME: "EduMeets",

          // UI
          DISABLE_DOMINANT_SPEAKER_INDICATOR: false,
          DISABLE_FOCUS_INDICATOR: false,
          DEFAULT_BACKGROUND: "#000000",

          // Mobile app promo
          MOBILE_APP_PROMO: false,
        }}
        getIFrameRef={(node) => {
          if (node) {
            node.style.height = "100vh";
            node.style.width = "100%";
            node.style.border = "none";
          }
        }}
      />
    </div>
  );
}
