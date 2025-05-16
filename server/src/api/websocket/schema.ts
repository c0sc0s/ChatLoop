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

// 添加聊天消息类型
export const ChatMessageType = {
  send: "chat:send",                 // 发送消息
  sent: "chat:sent",                 // 消息已发送确认
  received: "chat:received",         // 接收到新消息
  mark_read: "chat:mark_read",       // 标记消息为已读
  read: "chat:read",                 // 消息已被阅读通知
  read_confirmed: "chat:read_confirmed", // 已读确认
  typing: "chat:typing",             // 正在输入状态
  history: "chat:history"            // 请求历史消息
} as const;

export type ChatMessageType = (typeof ChatMessageType)[keyof typeof ChatMessageType];

export const MessageType = {
  connection: "connection",
  error: "error",
  message: "message",
  ping: "ping",
  // 集成聊天消息类型
  ...ChatMessageType
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const MessageSchema = z.object({
  type: z.nativeEnum(MessageType),
  data: z.any(),
});
