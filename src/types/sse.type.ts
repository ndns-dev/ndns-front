export const SseType = {
  CONNECTED: 'connected',
  MESSAGE: 'message',
  HEARTBEAT: 'heartbeat',
} as const;

/**
 * SSE 타입
 */
export type SseType = (typeof SseType)[keyof typeof SseType];
