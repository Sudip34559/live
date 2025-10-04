// components/JitsiRoom.tsx
import React, { useState, useEffect, useRef } from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";

// Type definitions
interface RoomData {
  meetingLink: string;
  jwt: string;
  participantCount: number;
  remainingSlots: number;
  maxParticipants: number;
  blocked: boolean;
}

interface JitsiRoomProps {
  roomId: string;
  userName: string;
  onMeetingEnd?: () => void; // Optional callback for when meeting ends
}

interface JitsiApi {
  addEventListener: (event: string, callback: (data?: any) => void) => void;
  removeEventListener: (event: string, callback: (data?: any) => void) => void;
  executeCommand: (command: string, ...args: any[]) => void;
  getNumberOfParticipants: () => number;
}

const JitsiRoom: React.FC<JitsiRoomProps> = ({
  roomId,
  userName,
  onMeetingEnd,
}) => {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [meetingEnded, setMeetingEnded] = useState<boolean>(false);
  const apiRef = useRef<JitsiApi | null>(null);
  const hasLeftRoom = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const fetchRoomAccess = async (): Promise<void> => {
      try {
        const response = await fetch(
          `/api/room/${roomId}/quick-join?name=${encodeURIComponent(userName)}`
        );
        const data: RoomData = await response.json();

        if (isMounted) {
          if (data.blocked) {
            setError(
              `Room is full (${data.participantCount}/${data.maxParticipants})`
            );
          } else {
            setRoomData(data);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to join room");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRoomAccess();

    // Cleanup function
    return (): void => {
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
  }, [roomId]);

  const leaveRoom = async (): Promise<void> => {
    if (hasLeftRoom.current) return;
    hasLeftRoom.current = true;

    try {
      await fetch(`/api/room/${roomId}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Successfully left room");
    } catch (error) {
      console.error("Failed to notify server of leave:", error);
    }
  };

  const handleMeetingEnd = (): void => {
    if (meetingEnded) return;

    setMeetingEnded(true);
    leaveRoom();

    // Custom callback for parent component
    if (onMeetingEnd) {
      onMeetingEnd();
    } else {
      // Default behavior - show meeting ended state
      setError("Meeting has ended");
    }
  };

  const handleApiReady = (api: JitsiApi): (() => void) => {
    apiRef.current = api;

    // Handle when meeting is ready to close (hangup button clicked)
    const handleReadyToClose = (): void => {
      console.log("Meeting ready to close - preventing default redirect");
      handleMeetingEnd();
    };

    // Handle when user leaves the video conference
    const handleVideoConferenceLeft = (data?: { roomName?: string }): void => {
      console.log("Video conference left:", data?.roomName);
      handleMeetingEnd();
    };

    // Handle when participant leaves (for cleanup)
    const handleParticipantLeft = (): void => {
      // Only trigger leave if it's the current user
      if (apiRef.current?.getNumberOfParticipants() === 0) {
        leaveRoom();
      }
    };

    // Add event listeners
    api.addEventListener("readyToClose", handleReadyToClose);
    api.addEventListener("videoConferenceLeft", handleVideoConferenceLeft);
    api.addEventListener("participantLeft", handleParticipantLeft);

    return () => {
      if (apiRef.current) {
        apiRef.current.removeEventListener("readyToClose", handleReadyToClose);
        apiRef.current.removeEventListener(
          "videoConferenceLeft",
          handleVideoConferenceLeft
        );
        apiRef.current.removeEventListener(
          "participantLeft",
          handleParticipantLeft
        );
      }
    };
  };

  const handleRetry = (): void => {
    setError(null);
    setLoading(true);
    setMeetingEnded(false);
    hasLeftRoom.current = false;

    // Re-trigger the effect
    window.location.reload();
  };

  const handleBackToDashboard = (): void => {
    // You can customize this based on your routing setup
    window.history.back();
    // Or use router: router.push('/dashboard');
  };

  console.log("Room Data JWT:", roomData?.jwt);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg font-medium">🔄 Joining room...</div>
          <div className="text-sm text-gray-500 mt-2">
            Please wait while we connect you
          </div>
        </div>
      </div>
    );
  }

  if (error || meetingEnded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="mb-4">
            {meetingEnded ? (
              <>
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Meeting Ended
                </h2>
                <p className="text-gray-600 mb-6">
                  Thank you for joining the meeting. You can now close this
                  window or return to the dashboard.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleBackToDashboard}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    type="button"
                  >
                    ← Back to Dashboard
                  </button>
                  <button
                    onClick={handleRetry}
                    className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    type="button"
                  >
                    Rejoin Meeting
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">
                  Cannot Join Room
                </h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="space-y-3">
                  <button
                    onClick={handleRetry}
                    className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    type="button"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleBackToDashboard}
                    className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    type="button"
                  >
                    ← Go Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            ❌ Room data unavailable
          </h2>
          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            type="button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="jitsi-room-container w-full h-full bg-black">
      {/* Participant Info Header */}
      {/* <div className="bg-white shadow-sm border-b px-6 py-3 mb-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="participant-info flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">👥</span>
              <span className="font-medium text-gray-800">
                {roomData.participantCount}/{roomData.maxParticipants}{" "}
                participants
              </span>
            </div>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {roomData.remainingSlots} slots remaining
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Room: <span className="font-mono text-gray-700">{roomId}</span>
          </div>
        </div>
      </div> */}

      {/* Jitsi Meeting Component */}
      <div className="meeting-container bg-black rounded-lg overflow-hidden shadow-lg">
        <JitsiMeeting
          domain={process.env.NEXT_PUBLIC_JITSI_DOMAIN || "live.edusathi.net"}
          roomName={roomId}
          jwt={roomData.jwt}
          onApiReady={handleApiReady}
          configOverwrite={{
            startWithAudioMuted: true,
            prejoinPageEnabled: false,
            disableModeratorIndicator: false,
            disableJoinLeaveNotifications: true,
            disableDeepLinking: true,
            enableClosePage: false,
            enableWelcomePage: false,
            inviteDomain: "localhost:3000",
          }}
          interfaceConfigOverwrite={{
            // Logo and branding removal
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            HIDE_DEEP_LINKING_LOGO: true,

            // UI customizations
            TOOLBAR_BUTTONS: [
              "microphone",
              "camera",
              "closedcaptions",
              "desktop",
              "embedmeeting",
              "fullscreen",
              "fodeviceselection",
              "hangup",
              "profile",
              "chat",
              "recording",
              "livestreaming",
              "etherpad",
              "sharedvideo",
              "settings",
              "raisehand",
              "videoquality",
              "filmstrip",
              "invite", // Keep the invite button
              "feedback",
              "stats",
              "shortcuts",
              "tileview",
              "videobackgroundblur",
              "download",
              "help",
              "mute-everyone",
              "security",
            ],

            // Additional customizations
            DISABLE_DOMINANT_SPEAKER_INDICATOR: true,
            DISABLE_FOCUS_INDICATOR: true,
            APP_NAME: "EduSathi",
            DEFAULT_BACKGROUND: "#000000",
          }}
          getIFrameRef={(parentNode: HTMLDivElement) => {
            if (parentNode) {
              parentNode.style.height = "100vh";
              parentNode.style.width = "100%";
              parentNode.style.borderRadius = "0px";
            }
          }}
        />
      </div>
    </div>
  );
};

export default JitsiRoom;
