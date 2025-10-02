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
}

interface JitsiApi {
  addEventListener: (event: string, callback: () => void) => void;
  removeEventListener: (event: string, callback: () => void) => void;
  executeCommand: (command: string, ...args: any[]) => void;
  getNumberOfParticipants: () => number;
}

const JitsiRoom: React.FC<JitsiRoomProps> = ({ roomId, userName }) => {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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

        // Only update state if component is still mounted
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

    // Cleanup function - runs on unmount or roomId change
    return (): void => {
      isMounted = false;

      // Only leave room if we successfully joined and haven't left yet
      if (roomData && !roomData.blocked && !hasLeftRoom.current) {
        leaveRoom();
      }
    };
  }, [roomId]); // Only depend on roomId to avoid infinite loops

  const leaveRoom = async (): Promise<void> => {
    if (hasLeftRoom.current) return; // Prevent duplicate calls

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

  const handleApiReady = (api: JitsiApi): (() => void) => {
    apiRef.current = api;

    const handleParticipantLeft = (): void => {
      leaveRoom();
    };

    api.addEventListener("participantLeft", handleParticipantLeft);

    return () => {
      if (apiRef.current) {
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
    hasLeftRoom.current = false;

    // Re-trigger the effect by updating a dependency
    window.location.reload(); // Simple approach, or use a retry state
  };

  if (loading) {
    return (
      <div className="loading">
        <div>🔄 Joining room...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>❌ Cannot Join Room</h2>
        <p>{error}</p>
        <button onClick={handleRetry} type="button">
          Try Again
        </button>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="error">
        <h2>❌ Room data unavailable</h2>
        <button onClick={handleRetry} type="button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="jitsi-room-container">
      <div className="participant-info">
        👥 {roomData.participantCount}/{roomData.maxParticipants} participants
        <span className="remaining-slots">
          ({roomData.remainingSlots} slots remaining)
        </span>
      </div>

      <JitsiMeeting
        domain={process.env.NEXT_PUBLIC_JITSI_DOMAIN || "live.edusathi.net"}
        roomName={roomId}
        jwt={roomData.jwt}
        onApiReady={handleApiReady}
        configOverwrite={{
          startWithAudioMuted: true,
          prejoinPageEnabled: false,
          disableModeratorIndicator: false,
        }}
        interfaceConfigOverwrite={{
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        }}
        getIFrameRef={(parentNode: HTMLDivElement) => {
          if (parentNode) {
            parentNode.style.height = "600px";
            parentNode.style.width = "100%";
          }
        }}
      />
    </div>
  );
};

export default JitsiRoom;
