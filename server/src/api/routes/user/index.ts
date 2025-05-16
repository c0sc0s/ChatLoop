import { FastifyPluginAsync } from "fastify";
import {
  getAllUsers,
  getUserById,
  getCurrentUser,
  searchUsers,
} from "./handlers";
import {
  getUserRouteSchema,
  searchUsersRouteSchema,
  getCurrentUserRouteSchema,
} from "./schema";

/**
 * 用户个人资料相关路由
 * 提供了用户的个人信息管理接口，包括获取用户信息和搜索用户
 */
const userRoutes: FastifyPluginAsync = async (fastify) => {
  // 用户个人资料相关路由
  fastify.get("/me", { schema: getCurrentUserRouteSchema }, getCurrentUser);
  fastify.get("/all", getAllUsers);

  /**
   * 搜索用户接口
   * GET /search?keyword=xxx&page=1&limit=10
   * 
   * 通过关键词搜索用户，可以搜索用户名或邮箱。
   * 这是添加好友流程的第一步，需要先搜索并找到目标用户，
   * 然后通过 /api/v1/friends/request 发送好友请求。
   * 
   * 参数:
   * - keyword: 必填，搜索关键词
   * - page: 可选，页码，默认值为1
   * - limit: 可选，每页数量，默认值为10
   * 
   * 详细参考: /docs/friend-api.md
   */
  fastify.get("/search", { schema: searchUsersRouteSchema }, searchUsers);
  fastify.get("/:id", { schema: getUserRouteSchema }, getUserById);

  // 注意：好友相关路由已移至 /api/v1/friends 路径下
  // 请参见 src/api/routes/friends/index.ts
};

export default userRoutes;
