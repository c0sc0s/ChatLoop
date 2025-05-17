import { FastifyInstance } from "fastify";
import {
  createGroup,
  getMyGroups,
  getGroupDetail,
  updateGroup,
  deleteGroup,
  leaveGroup,
} from "./handlers";
import {
  CreateGroupInput,
  UpdateGroupInput,
  GroupsQueryParams,
  GroupIdParam,
} from "./schema";
import membersRoutes from "./members";

/**
 * 群组管理路由
 */
export default async function (fastify: FastifyInstance) {
  // 为所有路由添加认证中间件
  fastify.addHook("onRequest", fastify.authenticate);

  // 创建群组
  fastify.post<{ Body: CreateGroupInput }>(
    "/",
    {
      schema: {
        body: CreateGroupInput,
      },
    },
    createGroup
  );

  // 获取我加入的群组列表
  fastify.get<{ Querystring: GroupsQueryParams }>(
    "/",
    {
      schema: {
        querystring: GroupsQueryParams,
      },
    },
    getMyGroups
  );

  // 获取群组详情
  fastify.get<{ Params: GroupIdParam }>(
    "/:groupId",
    {
      schema: {
        params: GroupIdParam,
      },
    },
    getGroupDetail
  );

  // 更新群组信息
  fastify.patch<{ Params: GroupIdParam; Body: UpdateGroupInput }>(
    "/:groupId",
    {
      schema: {
        params: GroupIdParam,
        body: UpdateGroupInput,
      },
    },
    updateGroup
  );

  // 解散群组
  fastify.delete<{ Params: GroupIdParam }>(
    "/:groupId",
    {
      schema: {
        params: GroupIdParam,
      },
    },
    deleteGroup
  );

  // 退出群组
  fastify.post<{ Params: GroupIdParam }>(
    "/:groupId/leave",
    {
      schema: {
        params: GroupIdParam,
      },
    },
    leaveGroup
  );

  // 注册群组成员管理路由
  fastify.register(membersRoutes, { prefix: "" });
} 