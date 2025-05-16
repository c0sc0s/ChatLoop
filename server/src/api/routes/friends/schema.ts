import { z } from "zod";
import { baseResponseSchema, successResponseSchema, errorResponseSchema } from "../auth/schema";

// 好友请求验证
export const friendRequestSchema = z.object({
  targetUserId: z.number().int().positive("用户ID必须是正整数"),
});

// 好友请求处理验证
export const friendActionSchema = z.object({
  requestId: z.number().int().positive("请求ID必须是正整数")
});

// 用户基本信息模式
export const userBasicSchema = z.object({
  id: z.number(),
  username: z.string(),
  avatar: z.string().nullable(),
  status: z.string(),
  lastActiveAt: z.string().nullable()
});

// 好友列表数据模式
export const friendsListSchema = z.object({
  friends: z.array(userBasicSchema),
  total: z.number()
});

// 好友请求数据模式
export const friendRequestDataSchema = z.object({
  id: z.number(),
  initiatorId: z.number(),
  receiverId: z.number(),
  status: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: z.object({
    id: z.number(),
    username: z.string(),
    avatar: z.string().nullable(),
    status: z.string()
  })
});

// 好友请求列表数据模式
export const friendRequestsListSchema = z.object({
  requests: z.array(friendRequestDataSchema),
  total: z.number()
});

// 好友列表成功响应
export const friendsListSuccessSchema = successResponseSchema.extend({
  data: friendsListSchema
});

// 好友请求列表成功响应
export const friendRequestsSuccessSchema = successResponseSchema.extend({
  data: friendRequestsListSchema
});

// 好友请求创建成功响应
export const friendRequestCreateSuccessSchema = successResponseSchema.extend({
  data: z.object({
    requestId: z.number()
  })
});

// 好友操作成功响应
export const friendActionSuccessSchema = successResponseSchema.extend({
  data: z.null()
});

// 路由Schema定义
export const getFriendsSchema = {
  response: {
    200: friendsListSuccessSchema,
    401: errorResponseSchema,
    500: errorResponseSchema
  }
};

export const getFriendRequestsSchema = {
  response: {
    200: friendRequestsSuccessSchema,
    401: errorResponseSchema,
    500: errorResponseSchema
  }
};

export const sendFriendRequestSchema = {
  body: friendRequestSchema,
  response: {
    201: friendRequestCreateSuccessSchema,
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema
  }
};

export const friendRequestActionSchema = {
  body: friendActionSchema,
  response: {
    200: friendActionSuccessSchema,
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema
  }
};

export const deleteFriendSchema = {
  params: z.object({
    friendId: z.string()
  }),
  response: {
    200: friendActionSuccessSchema,
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema
  }
};

// 类型导出
export type FriendRequestInput = z.infer<typeof friendRequestSchema>;
export type FriendActionInput = z.infer<typeof friendActionSchema>;
export type FriendsListResponse = z.infer<typeof friendsListSuccessSchema>;
export type FriendRequestsResponse = z.infer<typeof friendRequestsSuccessSchema>;