import { z } from "zod";

// 基础响应模式 (与auth中保持一致)
export const baseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  timestamp: z.string(),
  code: z.number(),
});

// 成功响应模式
export const successResponseSchema = baseResponseSchema.extend({
  success: z.literal(true),
  data: z.any().optional(),
});

// 错误响应模式
export const errorResponseSchema = baseResponseSchema.extend({
  success: z.literal(false),
  error: z.string(),
});

// API响应模式
export const apiResponseSchema = z.union([
  successResponseSchema,
  errorResponseSchema,
]);

// 消息模式
export const messageSchema = z.object({
  id: z.number(),
  conversationId: z.number(),
  senderId: z.number(),
  content: z.string().nullable(),
  type: z.string(),
  mediaUrl: z.string().nullable().optional(),
  status: z.string(),
  createdAt: z.string().or(z.date()),
  sender: z.object({
    id: z.number(),
    username: z.string(),
    avatar: z.string().nullable().optional(),
  }),
});

// 会话参与者模式
export const participantSchema = z.object({
  userId: z.number(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    avatar: z.string().nullable().optional(),
    status: z.string().optional(),
  }),
  lastReadAt: z.string().or(z.date()),
});

// 会话模式
export const conversationSchema = z.object({
  id: z.number(),
  type: z.string(),
  lastMessageAt: z.string().or(z.date()).nullable(),
  createdAt: z.string().or(z.date()),
  participants: z.array(participantSchema),
  latestMessage: messageSchema.optional().nullable(),
});

// 会话列表响应
export const conversationsResponseSchema = successResponseSchema.extend({
  data: z.object({
    conversations: z.array(conversationSchema),
    totalCount: z.number(),
  }),
});

// 单个会话响应
export const conversationResponseSchema = successResponseSchema.extend({
  data: z.object({
    conversation: conversationSchema,
  }),
});

// 消息列表响应
export const messagesResponseSchema = successResponseSchema.extend({
  data: z.object({
    messages: z.array(messageSchema),
    totalCount: z.number(),
  }),
});

// 创建会话请求
export const createConversationSchema = {
  body: z.object({
    participantIds: z.array(z.number()).min(1, "至少需要一个参与者"),
    type: z.enum(["direct", "group"]).default("direct"),
    initialMessage: z.string().optional(),
  }),
  response: {
    200: conversationResponseSchema,
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};

// 获取会话列表请求
export const getConversationsSchema = {
  querystring: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
    type: z.string().optional(),
  }).optional(),
  response: {
    200: conversationsResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};

// 获取单个会话请求
export const getConversationByIdSchema = {
  params: z.object({
    id: z.string().transform(val => parseInt(val)),
  }),
  response: {
    200: conversationResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};

// 获取会话消息请求
export const getConversationMessagesSchema = {
  params: z.object({
    id: z.string().transform(val => parseInt(val)),
  }),
  querystring: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
    before: z.string().optional(),
  }).optional(),
  response: {
    200: messagesResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};

// 标记消息为已读请求
export const markMessagesAsReadSchema = {
  body: z.object({
    conversationId: z.number(),
    messageIds: z.array(z.number()).optional(),
  }),
  response: {
    200: successResponseSchema.extend({
      data: z.object({
        updatedAt: z.string().or(z.date()),
      }),
    }),
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};

// 类型导出
export type CreateConversationInput = z.infer<typeof createConversationSchema.body>;
export type GetConversationsQuery = z.infer<typeof getConversationsSchema.querystring>;
export type GetConversationParams = z.infer<typeof getConversationByIdSchema.params>;
export type GetMessagesParams = z.infer<typeof getConversationMessagesSchema.params>;
export type GetMessagesQuery = z.infer<typeof getConversationMessagesSchema.querystring>;
export type MarkMessagesAsReadInput = z.infer<typeof markMessagesAsReadSchema.body>; 