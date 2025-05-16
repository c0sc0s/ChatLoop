import { FastifyInstance } from "fastify";
import {
  getConversations,
  getConversationById,
  getConversationMessages,
  createConversation,
  markMessagesAsRead
} from "./handlers";
import {
  getConversationsSchema,
  getConversationByIdSchema,
  getConversationMessagesSchema,
  createConversationSchema,
  markMessagesAsReadSchema,
} from "./schema";

/**
 * 聊天相关路由
 * 提供聊天会话和消息的管理API
 */
export default async function chatRoutes(fastify: FastifyInstance) {

  // 获取当前用户的所有会话
  fastify.get("/conversations", {
    schema: getConversationsSchema,
    handler: getConversations,
  });

  // 获取特定会话详情
  fastify.get("/conversations/:id", {
    schema: getConversationByIdSchema,
    handler: getConversationById,
  });

  // 获取特定会话的消息
  fastify.get("/conversations/:id/messages", {
    schema: getConversationMessagesSchema,
    handler: getConversationMessages,
  });

  // 创建新会话
  fastify.post("/conversations", {
    schema: createConversationSchema,
    handler: createConversation,
  });

  // 标记消息为已读
  fastify.post("/messages/read", {
    schema: markMessagesAsReadSchema,
    handler: markMessagesAsRead,
  });
} 