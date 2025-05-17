import { z } from "zod";
import { GroupIdParam } from "../schema";

// 群组成员ID参数
export const GroupMemberIdParam = z.object({
  groupId: z.coerce.number().int().positive(),
  memberId: z.coerce.number().int().positive(),
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
export type GroupMemberIdParam = z.infer<typeof GroupMemberIdParam>;
export type GroupMembersQueryParams = z.infer<typeof GroupMembersQueryParams>;
export type AddMembersInput = z.infer<typeof AddMembersInput>;
export type UpdateMemberRoleInput = z.infer<typeof UpdateMemberRoleInput>;
export type GroupMemberRole = z.infer<typeof GroupMemberRole>; 