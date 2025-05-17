import { FastifyInstance } from "fastify";
import {
  getGroupMembers,
  addMembers,
  removeMember,
  updateMemberRole,
  transferOwnership
} from "./handlers";
import {
  GroupMemberIdParam,
  GroupMembersQueryParams,
  AddMembersInput,
  UpdateMemberRoleInput
} from "./schema";
import { GroupIdParam } from "../schema";

/**
 * 群组成员管理路由（模块化）
 */
export default async function (fastify: FastifyInstance) {
  // 为所有路由添加认证中间件
  fastify.addHook("onRequest", fastify.authenticate);

  // 获取群组成员列表
  fastify.get<{ Params: GroupIdParam; Querystring: GroupMembersQueryParams }>(
    "/",
    {
      schema: {
        params: GroupIdParam,
        querystring: GroupMembersQueryParams,
      },
    },
    getGroupMembers
  );

  // 添加群组成员
  fastify.post<{ Params: GroupIdParam; Body: AddMembersInput }>(
    "/",
    {
      schema: {
        params: GroupIdParam,
        body: AddMembersInput,
      },
    },
    addMembers
  );

  // 移除群组成员
  fastify.delete<{ Params: GroupMemberIdParam }>(
    "/:memberId",
    {
      schema: {
        params: GroupMemberIdParam,
      },
    },
    removeMember
  );

  // 更新群组成员角色
  fastify.patch<{ Params: GroupMemberIdParam; Body: UpdateMemberRoleInput }>(
    "/:memberId/role",
    {
      schema: {
        params: GroupMemberIdParam,
        body: UpdateMemberRoleInput,
      },
    },
    updateMemberRole
  );

  // 转让群主
  fastify.patch<{ Params: GroupMemberIdParam }>(
    "/transfer-ownership/:memberId",
    {
      schema: {
        params: GroupMemberIdParam,
      },
    },
    transferOwnership
  );
} 