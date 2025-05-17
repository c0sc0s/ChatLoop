/**
 * 聊天相关的共享类型
 */

// 会话类型
export type ConversationType = "direct" | "group";

// 消息类型
export type MessageType =
  | "text"
  | "image"
  | "file"
  | "audio"
  | "video"
  | "call_audio"
  | "call_video";

// 消息状态
export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

// 通话状态
export type CallStatus = "missed" | "answered" | "rejected" | "completed";

// 会话参与者用户信息
export interface ParticipantUserSchema {
  id: number;
  username: string;
  avatar?: string | null;
  status?: string;
}

// 会话参与者信息
export interface ParticipantSchema {
  userId: number;
  user: ParticipantUserSchema;
  lastReadAt: string;
}

// 消息发送者信息
export interface MessageSenderSchema {
  id: number;
  username: string;
  avatar?: string | null;
}

// 消息信息
export interface MessageSchema {
  id: number;
  conversationId: number;
  senderId: number;
  content: string | null;
  type: string;
  mediaUrl?: string | null;
  status: string;
  createdAt: string;
  sender: MessageSenderSchema;
  replyTo?: {
    id: number;
    content: string | null;
    senderId: number;
    senderName: string;
  } | null;
  callStatus?: string | null;
  callDuration?: number | null;
}

// 会话信息
export interface ConversationSchema {
  id: number;
  type: string;
  name?: string; // 群组名称，仅群聊有效
  avatar?: string | null; // 群组头像，仅群聊有效
  description?: string | null; // 群组描述，仅群聊有效
  lastMessageAt: string | null;
  createdAt: string;
  participants: ParticipantSchema[];
  latestMessage: MessageSchema | null;
}

// 会话列表响应
export interface ConversationsResponse {
  conversations: ConversationSchema[];
  totalCount: number;
}

// 单个会话响应
export interface ConversationResponse {
  conversation: ConversationSchema;
}

// 消息列表响应
export interface MessagesResponse {
  messages: MessageSchema[];
  totalCount: number;
}

// 标记消息已读响应
export interface MarkAsReadResponse {
  updatedAt: string;
}

// 创建会话请求参数
export interface CreateConversationInput {
  participantIds: number[]; // 参与者用户ID列表，至少需要一个用户ID
  type: "direct" | "group"; // 会话类型，默认为"direct"
  initialMessage?: string; // 可选，创建会话时发送的第一条消息
}

// 标记消息为已读请求参数
export interface MarkMessagesAsReadInput {
  conversationId: number; // 会话ID
  messageIds?: number[]; // 可选，需要标记为已读的消息ID列表，如果不提供则更新整个会话的阅读状态
}

// 获取会话列表参数
export interface GetConversationsParams {
  page?: number;
  limit?: number;
  type?: ConversationType;
}

// 获取会话消息参数
export interface GetMessagesParams {
  conversationId: number;
  page?: number;
  limit?: number;
  before?: string; // 时间戳，获取此时间戳之前的消息
}

// 发送消息请求参数
export interface SendMessageInput {
  conversationId: number;
  content: string;
  type?: MessageType;
  mediaUrl?: string;
  replyToId?: number;
}

// 向后兼容的类型定义
export type GetConversationsSuccessResponse = ConversationsResponse;
export type GetConversationSuccessResponse = ConversationResponse;
export type GetMessagesSuccessResponse = MessagesResponse;
export type CreateConversationSuccessResponse = ConversationResponse;
export type MarkMessagesAsReadSuccessResponse = MarkAsReadResponse;

// 以下是为了兼容旧代码的类型定义
export interface ConversationParticipantBasic {
  id: number;
  username: string;
  avatar: string | null;
  status: string;
}

export interface LastMessageInfo {
  id: number;
  content: string | null;
  type: string;
  createdAt: string | Date;
  senderId: number;
  senderName: string;
}

export interface GroupBasic {
  id: number;
  name: string;
  avatar: string | null;
}

export interface ConversationBasic {
  id: number;
  type: string;
  lastMessageAt: string | Date | null;
  unreadCount: number;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  participants: ConversationParticipantBasic[];
  lastMessage: LastMessageInfo | null;
  group: GroupBasic | null;
}

export interface ReplyInfo {
  id: number;
  content: string | null;
  senderId: number;
  senderName: string;
}

export interface MessageSender {
  id: number;
  username: string;
  avatar: string | null;
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string | null;
  type: string;
  mediaUrl: string | null;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  sender: MessageSender;
  replyTo: ReplyInfo | null;
  callStatus: string | null;
  callDuration: number | null;
}

export interface CreateDirectConversationBody {
  userId: number;
}

export interface CreateGroupConversationBody {
  name: string;
  userIds: number[];
}

export interface ReadMessagesBody {
  conversationId: number;
  lastReadMessageId?: number;
}

export interface DeleteMessageParams {
  id: string;
}

export interface InitiateCallBody {
  conversationId: number;
  type: "audio" | "video";
}

export interface UpdateCallStatusBody {
  messageId: number;
  status: CallStatus;
  duration?: number;
}

export interface ConversationsListResponse {
  conversations: ConversationBasic[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface MessagesListResponse {
  messages: Message[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
