import { z } from "zod";

// ===== 请求模式 =====

// 创建群组请求
export const createGroupSchema = z.object({
  name: z.string().min(1, "群组名称不能为空").max(50, "群组名称不能超过50个字符"),
  description: z.string().max(500, "群组描述不能超过500个字符").optional(),
  avatar: z.string().url("头像URL格式不正确").optional(),
  initialMemberIds: z.array(z.number()).optional(),
});

// 更新群组请求
export const updateGroupSchema = z.object({
  name: z.string().min(1, "群组名称不能为空").max(50, "群组名称不能超过50个字符").optional(),
  description: z.string().max(500, "群组描述不能超过500个字符").optional(),
  avatar: z.string().url("头像URL格式不正确").optional(),
});

// 获取群组列表查询参数
export const getGroupsQuerySchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
});

// 群组ID参数
export const groupIdParamSchema = z.object({
  groupId: z.coerce.number(),
});

// ===== 响应模式 =====

// 群组响应基础模式
export const groupResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  avatar: z.string().nullable(),
  description: z.string().nullable(),
  creatorId: z.number(),
  createdAt: z.string(),
});

// 创建群组响应
export const createGroupResponseSchema = groupResponseSchema.extend({
  conversationId: z.number(),
});

// 更新群组响应
export const updateGroupResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  avatar: z.string().nullable(),
  description: z.string().nullable(),
  updatedAt: z.string(),
});

// 群组详情响应
export const groupDetailResponseSchema = groupResponseSchema.extend({
  memberCount: z.number(),
  conversationId: z.number().nullable(),
  userRole: z.string(),
});

// 群组列表项响应
export const groupListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  avatar: z.string().nullable(),
  description: z.string().nullable(),
  memberCount: z.number(),
  role: z.string(),
  lastMessageAt: z.string().nullable(),
  conversationId: z.number(),
});

// 群组列表响应
export const groupListResponseSchema = z.object({
  groups: z.array(groupListItemSchema),
  totalCount: z.number(),
});

// 操作成功响应
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// ===== 成员管理模式 =====

// 添加成员请求
export const addMembersSchema = z.object({
  userIds: z.array(z.number()).min(1, "至少需要指定一个用户"),
});

// 更新成员角色请求
export const updateMemberRoleSchema = z.object({
  role: z.enum(["owner", "admin", "member"]),
});

// 转让群主请求
export const transferOwnershipSchema = z.object({
  newOwnerId: z.number(),
});

// 群组成员响应
export const groupMemberSchema = z.object({
  id: z.number(),
  userId: z.number(),
  username: z.string(),
  avatar: z.string().nullable(),
  role: z.string(),
  nickname: z.string().nullable(),
  joinedAt: z.string(),
});

// 群组成员列表响应
export const groupMembersResponseSchema = z.object({
  members: z.array(groupMemberSchema),
  totalCount: z.number(),
});

// ===== 路由模式 =====

// 创建群组路由模式
export const createGroupRouteSchema = {
  body: createGroupSchema,
  response: {
    201: createGroupResponseSchema,
  },
};

// 获取群组列表路由模式
export const getGroupsRouteSchema = {
  querystring: getGroupsQuerySchema,
  response: {
    200: groupListResponseSchema,
  },
};

// 获取群组详情路由模式
export const getGroupDetailRouteSchema = {
  params: groupIdParamSchema,
  response: {
    200: groupDetailResponseSchema,
  },
};

// 更新群组路由模式
export const updateGroupRouteSchema = {
  params: groupIdParamSchema,
  body: updateGroupSchema,
  response: {
    200: updateGroupResponseSchema,
  },
};

// 删除群组路由模式
export const deleteGroupRouteSchema = {
  params: groupIdParamSchema,
  response: {
    200: successResponseSchema,
  },
};

// 离开群组路由模式
export const leaveGroupRouteSchema = {
  params: groupIdParamSchema,
  response: {
    200: successResponseSchema,
  },
};

// 获取群组成员路由模式
export const getGroupMembersRouteSchema = {
  params: groupIdParamSchema,
  querystring: getGroupsQuerySchema,
  response: {
    200: groupMembersResponseSchema,
  },
};

// 添加群组成员路由模式
export const addGroupMembersRouteSchema = {
  params: groupIdParamSchema,
  body: addMembersSchema,
  response: {
    200: successResponseSchema,
  },
};

// 移除群组成员路由模式
export const removeGroupMemberRouteSchema = {
  params: z.object({
    groupId: z.coerce.number(),
    userId: z.coerce.number(),
  }),
  response: {
    200: successResponseSchema,
  },
};

// 更新成员角色路由模式
export const updateMemberRoleRouteSchema = {
  params: z.object({
    groupId: z.coerce.number(),
    userId: z.coerce.number(),
  }),
  body: updateMemberRoleSchema,
  response: {
    200: successResponseSchema,
  },
};

// 转让群主路由模式
export const transferOwnershipRouteSchema = {
  params: groupIdParamSchema,
  body: transferOwnershipSchema,
  response: {
    200: successResponseSchema,
  },
};

// 基础参数：群组ID
export const GroupIdParam = z.object({
  groupId: z.coerce.number().int().positive(),
});

// 群组成员ID参数
export const GroupMemberIdParam = z.object({
  groupId: z.coerce.number().int().positive(),
  memberId: z.coerce.number().int().positive(),
});

// 创建群组请求体
export const CreateGroupInput = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  avatar: z.string().url().optional(),
  initialMemberIds: z.array(z.number().int().positive()).optional(),
});

// 更新群组请求体
export const UpdateGroupInput = z.object({
  name: z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  avatar: z.string().url().optional(),
});

// 群组列表查询参数
export const GroupsQueryParams = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// 群组成员列表查询参数
export const GroupMembersQueryParams = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// 添加群组成员
export const AddMembersInput = z.object({
  memberIds: z.array(z.number().int().positive()).min(1),
});

// 群组成员角色枚举
export const GroupMemberRole = z.enum(["owner", "admin", "member"]);

// 更新成员角色
export const UpdateMemberRoleInput = z.object({
  role: GroupMemberRole.exclude(["owner"]), // 不允许直接将成员角色设为群主
});

// 类型导出
export type GroupIdParam = z.infer<typeof GroupIdParam>;
export type GroupMemberIdParam = z.infer<typeof GroupMemberIdParam>;
export type CreateGroupInput = z.infer<typeof CreateGroupInput>;
export type UpdateGroupInput = z.infer<typeof UpdateGroupInput>;
export type GroupsQueryParams = z.infer<typeof GroupsQueryParams>;
export type GroupMembersQueryParams = z.infer<typeof GroupMembersQueryParams>;
export type AddMembersInput = z.infer<typeof AddMembersInput>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleInput>;
export type GroupMemberRole = z.infer<typeof GroupMemberRole>; 