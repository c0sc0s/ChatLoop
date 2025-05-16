import { FastifyInstance } from "fastify";
import {
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  deleteFriend
} from "./handlers";
import {
  getFriendsSchema,
  getFriendRequestsSchema,
  sendFriendRequestSchema,
  friendRequestActionSchema,
  deleteFriendSchema
} from "./schema";

/**
 * 好友系统路由
 * 提供了管理用户间好友关系的API，包括：
 * - 获取好友列表
 * - 获取好友请求列表
 * - 发送好友请求
 * - 接受好友请求
 * - 拒绝好友请求
 * - 删除好友
 * 
 * 完整文档参见: /docs/friend-api.md
 */
export default async function friendRoutes(fastify: FastifyInstance) {
  // 获取好友列表
  // GET /
  // 返回当前用户的所有好友列表
  fastify.get("/", {
    schema: getFriendsSchema,
    handler: getFriends
  });

  // 获取好友请求列表
  // GET /requests
  // 返回发送给当前用户的待处理好友请求列表
  fastify.get("/requests", {
    schema: getFriendRequestsSchema,
    handler: getFriendRequests
  });

  // 发送好友请求
  // POST /request
  // 向指定用户发送好友请求
  // 需要先通过 /api/v1/users/search 搜索用户
  fastify.post("/request", {
    schema: sendFriendRequestSchema,
    handler: sendFriendRequest
  });

  // 接受好友请求
  // POST /accept
  // 接受一个好友请求
  fastify.post("/accept", {
    schema: friendRequestActionSchema,
    handler: acceptFriendRequest
  });

  // 拒绝好友请求
  // POST /reject
  // 拒绝一个好友请求
  fastify.post("/reject", {
    schema: friendRequestActionSchema,
    handler: rejectFriendRequest
  });

  // 删除好友
  // DELETE /:friendId
  // 删除一个现有的好友关系
  fastify.delete("/:friendId", {
    schema: deleteFriendSchema,
    handler: deleteFriend
  });
}