import { z } from "zod";

export const FriendMessageType = {
  request: "friend:request",           // 发送好友请求
  request_received: "friend:request_received", // 收到好友请求通知
  accept: "friend:accept",             // 接受好友请求
  accept_received: "friend:accept_received",   // 请求被接受通知
  reject: "friend:reject",             // 拒绝好友请求
  reject_received: "friend:reject_received",   // 请求被拒绝通知
  delete: "friend:delete",             // 删除好友
  delete_received: "friend:delete_received",   // 被删除通知
  online_status: "friend:online_status"        // 好友在线状态变更
} as const;

export type FriendMessageType = (typeof FriendMessageType)[keyof typeof FriendMessageType];
export const MessageType = {
  connection: "connection",
  error: "error",
  message: "message",
  ping: "ping",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const MessageSchema = z.object({
  type: z.nativeEnum(MessageType),
  data: z.any(),
});
