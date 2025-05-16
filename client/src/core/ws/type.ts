export const MessageType = {
  connection: "connection",
  error: "error",
  message: "message",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface IWsMessage {
  type: MessageType;
  data: any;
}

export type WsEventCallback = (data: any) => void;
