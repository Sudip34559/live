import redis from "@/lib/redis";

interface RoomConfig {
  maxParticipants: number;
  expiryTime: number; // in seconds
}

interface JoinResult {
  success: boolean;
  count: number;
  remaining: number;
  message?: string;
}

interface LeaveResult {
  success: boolean;
  count: number;
  remaining: number;
}

interface CountResult {
  count: number;
  remaining: number;
  isFull: boolean;
}

export class ParticipantManager {
  static getKey(roomId: string): string {
    return `room:${roomId}:participants`;
  }

  static getConfigKey(roomId: string): string {
    return `room:${roomId}:config`;
  }

  /** Save config for a room (e.g. when it's created) */
  static async setConfig(roomId: string, config: RoomConfig) {
    const key = this.getConfigKey(roomId);
    await redis.hmset(key, {
      maxParticipants: config.maxParticipants.toString(),
      expiryTime: config.expiryTime.toString(),
    });
  }

  /** Load config for a room (fallback defaults if missing) */
  static async getConfig(roomId: string): Promise<RoomConfig> {
    const key = this.getConfigKey(roomId);
    const config = await redis.hgetall(key);
    return {
      maxParticipants: config.maxParticipants
        ? Number(config.maxParticipants)
        : 0,
      expiryTime: config.expiryTime ? Number(config.expiryTime) : 0,
    };
  }

  /** Check and increment participant count */
  static async joinRoom(roomId: string): Promise<JoinResult> {
    const key = this.getKey(roomId);
    const { maxParticipants, expiryTime } = await this.getConfig(roomId);

    try {
      const newCount = await redis.incr(key);

      // Set expiry when first participant joins
      if (newCount === 1) {
        await redis.expire(key, expiryTime);
      }

      if (newCount > maxParticipants) {
        await redis.decr(key);
        return {
          success: false,
          count: maxParticipants,
          remaining: 0,
          message: "Room is full",
        };
      }

      return {
        success: true,
        count: newCount,
        remaining: maxParticipants - newCount,
      };
    } catch (error) {
      console.error("Redis join error:", error);
      throw new Error("Failed to join room");
    }
  }

  /** Decrement participant count */
  static async leaveRoom(roomId: string): Promise<LeaveResult> {
    const key = this.getKey(roomId);
    const { maxParticipants } = await this.getConfig(roomId);

    try {
      const value = await redis.get(key);
      const currentCount = value ? parseInt(value, 10) : 0;

      if (currentCount > 0) {
        const newCount = await redis.decr(key);
        const safeCount = Math.max(0, newCount);

        return {
          success: true,
          count: safeCount,
          remaining: maxParticipants - safeCount,
        };
      }

      return { success: true, count: 0, remaining: maxParticipants };
    } catch (error) {
      console.error("Redis leave error:", error);
      throw new Error("Failed to leave room");
    }
  }

  /** Get current participant count */
  static async getCount(roomId: string): Promise<CountResult> {
    const key = this.getKey(roomId);
    const { maxParticipants } = await this.getConfig(roomId);

    try {
      const value = await redis.get(key);
      const count = value ? parseInt(value, 10) : 0;

      return {
        count,
        remaining: maxParticipants - count,
        isFull: count >= maxParticipants,
      };
    } catch (error) {
      console.error("Redis get count error:", error);
      return { count: 0, remaining: 0, isFull: false };
    }
  }
}
