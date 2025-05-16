import Request from "./client";
import type {
  ConversationsResponse,
  ConversationResponse,
  MessagesResponse,
  MarkAsReadResponse,
  GetConversationsParams,
  CreateConversationInput,
  GetMessagesParams,
  SendMessageInput,
  MarkMessagesAsReadInput,
  MessageSchema
} from "@/common/types/chat";

/**
 * 获取当前用户参与的所有会话
 * @param params 查询参数，包括页码、每页数量和会话类型
 * @returns 会话列表和总数
 */
export const getConversations = async (params?: GetConversationsParams): Promise<ConversationsResponse> => {
  return await Request.get(`/chat/conversations`, { params });
};

/**
 * 获取特定会话的详细信息
 * @param conversationId 会话ID
 * @returns 会话详情
 */
export const getConversation = async (conversationId: number): Promise<ConversationResponse> => {
  return await Request.get(`/chat/conversations/${conversationId}`);
};

/**
 * 获取特定会话的消息历史记录
 * @param params 查询参数，包括会话ID、页码、每页数量和时间戳
 * @returns 消息列表和总数
 */
export const getMessages = async (params: GetMessagesParams): Promise<MessagesResponse> => {
  const { conversationId, ...queryParams } = params;
  return await Request.get(`/chat/conversations/${conversationId}/messages`, { params: queryParams });
};

/**
 * 创建一个新的聊天会话
 * @param data 创建会话参数，包括参与者列表、会话类型和初始消息
 * @returns 创建的会话详情
 */
export const createConversation = async (data: CreateConversationInput): Promise<ConversationResponse> => {
  return await Request.post(`/chat/conversations`, data);
};

/**
 * 标记会话中的消息为已读状态
 * @param data 标记已读参数，包括会话ID和可选的消息ID列表
 * @returns 更新时间
 */
export const markMessagesAsRead = async (data: MarkMessagesAsReadInput): Promise<MarkAsReadResponse> => {
  return await Request.post(`/chat/messages/read`, data);
};

/**
 * 删除指定消息
 * @param messageId 消息ID
 * @returns void
 */
export const deleteMessage = async (messageId: number): Promise<void> => {
  return await Request.delete(`/chat/messages/${messageId}`);
};

/**
 * 更新消息状态
 * @param messageId 消息ID
 * @param status 新状态
 * @returns 更新后的消息
 */
export const updateMessageStatus = async (messageId: number, status: string): Promise<MessageSchema> => {
  return await Request.patch(`/chat/messages/${messageId}/status`, { status });
}; 